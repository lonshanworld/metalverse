package services_test

import (
	"errors"
	"testing"

	"medalverse-be/internal/models"
	"medalverse-be/internal/services"

	"github.com/google/uuid"
)

// --- mock repository ---

type mockCredentialRepo struct {
	getAllFn          func() ([]models.Credential, error)
	getAllPaginatedFn func(page, pageSize int) ([]models.Credential, int64, error)
	getByIDFn         func(id uuid.UUID) (*models.Credential, error)
	getByUserIDFn     func(userID uuid.UUID) ([]models.Credential, error)
	getByEventIDFn    func(eventID uuid.UUID) ([]models.Credential, error)
	createFn          func(c *models.Credential) error
	updateFn          func(c *models.Credential) error
	deleteFn          func(id uuid.UUID) error
}

func (m *mockCredentialRepo) GetAll() ([]models.Credential, error) {
	return m.getAllFn()
}
func (m *mockCredentialRepo) GetAllPaginated(page, pageSize int) ([]models.Credential, int64, error) {
	return m.getAllPaginatedFn(page, pageSize)
}
func (m *mockCredentialRepo) GetByID(id uuid.UUID) (*models.Credential, error) {
	return m.getByIDFn(id)
}
func (m *mockCredentialRepo) GetByUserID(userID uuid.UUID) ([]models.Credential, error) {
	return m.getByUserIDFn(userID)
}
func (m *mockCredentialRepo) GetByEventID(eventID uuid.UUID) ([]models.Credential, error) {
	if m.getByEventIDFn != nil {
		return m.getByEventIDFn(eventID)
	}
	return nil, nil
}
func (m *mockCredentialRepo) Create(c *models.Credential) error { return m.createFn(c) }
func (m *mockCredentialRepo) Update(c *models.Credential) error { return m.updateFn(c) }
func (m *mockCredentialRepo) Delete(id uuid.UUID) error         { return m.deleteFn(id) }

// helpers

func makeCredentials(n int) []models.Credential {
	creds := make([]models.Credential, n)
	for i := range creds {
		creds[i] = models.Credential{CredentialID: uuid.New()}
	}
	return creds
}

func newSvc(repo *mockCredentialRepo) services.CredentialService {
	return services.NewCredentialService(repo)
}

// --- tests ---

func TestGetPaginated_ReturnsCorrectPage(t *testing.T) {
	page, pageSize := 2, 5
	data := makeCredentials(5)
	var total int64 = 12

	repo := &mockCredentialRepo{
		getAllPaginatedFn: func(p, ps int) ([]models.Credential, int64, error) {
			if p != page || ps != pageSize {
				t.Errorf("expected page=%d pageSize=%d, got page=%d pageSize=%d", page, pageSize, p, ps)
			}
			return data, total, nil
		},
	}

	result, err := newSvc(repo).GetPaginated(page, pageSize)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result.Page != page {
		t.Errorf("Page: want %d, got %d", page, result.Page)
	}
	if result.PageSize != pageSize {
		t.Errorf("PageSize: want %d, got %d", pageSize, result.PageSize)
	}
	if result.Total != total {
		t.Errorf("Total: want %d, got %d", total, result.Total)
	}
	if len(result.Data) != len(data) {
		t.Errorf("Data length: want %d, got %d", len(data), len(result.Data))
	}
}

func TestGetPaginated_TotalPagesCalculation(t *testing.T) {
	cases := []struct {
		total         int64
		pageSize      int
		wantTotalPges int64
	}{
		{total: 10, pageSize: 5, wantTotalPges: 2},
		{total: 11, pageSize: 5, wantTotalPges: 3},
		{total: 0, pageSize: 10, wantTotalPges: 0},
		{total: 1, pageSize: 10, wantTotalPges: 1},
		{total: 100, pageSize: 10, wantTotalPges: 10},
	}

	for _, tc := range cases {
		tc := tc
		t.Run("", func(t *testing.T) {
			repo := &mockCredentialRepo{
				getAllPaginatedFn: func(p, ps int) ([]models.Credential, int64, error) {
					return makeCredentials(int(tc.total)), tc.total, nil
				},
			}
			result, err := newSvc(repo).GetPaginated(1, tc.pageSize)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if result.TotalPages != tc.wantTotalPges {
				t.Errorf("TotalPages: want %d, got %d (total=%d pageSize=%d)",
					tc.wantTotalPges, result.TotalPages, tc.total, tc.pageSize)
			}
		})
	}
}

func TestGetPaginated_DefaultsInvalidPage(t *testing.T) {
	var calledPage int
	repo := &mockCredentialRepo{
		getAllPaginatedFn: func(p, ps int) ([]models.Credential, int64, error) {
			calledPage = p
			return nil, 0, nil
		},
	}

	// page=0 should be clamped to 1
	_, err := newSvc(repo).GetPaginated(0, 10)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if calledPage != 1 {
		t.Errorf("expected page to be clamped to 1, got %d", calledPage)
	}
}

func TestGetPaginated_DefaultsInvalidPageSize(t *testing.T) {
	cases := []struct {
		input    int
		wantSize int
	}{
		{0, 10},
		{-1, 10},
		{101, 10},
	}

	for _, tc := range cases {
		tc := tc
		t.Run("", func(t *testing.T) {
			var calledPS int
			repo := &mockCredentialRepo{
				getAllPaginatedFn: func(p, ps int) ([]models.Credential, int64, error) {
					calledPS = ps
					return nil, 0, nil
				},
			}
			_, err := newSvc(repo).GetPaginated(1, tc.input)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if calledPS != tc.wantSize {
				t.Errorf("pageSize=%d: expected %d, got %d", tc.input, tc.wantSize, calledPS)
			}
		})
	}
}

func TestGetPaginated_PropagatesRepoError(t *testing.T) {
	wantErr := errors.New("db error")
	repo := &mockCredentialRepo{
		getAllPaginatedFn: func(p, ps int) ([]models.Credential, int64, error) {
			return nil, 0, wantErr
		},
	}

	_, err := newSvc(repo).GetPaginated(1, 10)
	if !errors.Is(err, wantErr) {
		t.Errorf("expected %v, got %v", wantErr, err)
	}
}
