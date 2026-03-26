package tests

import (
	"errors"
	"testing"
	"time"

	"medalverse-be/internal/models"
	"medalverse-be/internal/services"

	"github.com/google/uuid"
)

// --- mock repository ---

type mockMVCRepo struct {
	getAllFn     func() ([]models.MedalVerseCode, error)
	getByIDFn    func(id uuid.UUID) (*models.MedalVerseCode, error)
	getByCodeFn  func(code string) (*models.MedalVerseCode, error)
	getByEventFn func(eventID uuid.UUID) ([]models.MedalVerseCode, error)
	createFn     func(code *models.MedalVerseCode) error
	updateFn     func(code *models.MedalVerseCode) error
	deleteFn     func(id uuid.UUID) error
}

func (m *mockMVCRepo) GetAll() ([]models.MedalVerseCode, error) { return m.getAllFn() }
func (m *mockMVCRepo) GetByID(id uuid.UUID) (*models.MedalVerseCode, error) {
	return m.getByIDFn(id)
}
func (m *mockMVCRepo) GetByCode(code string) (*models.MedalVerseCode, error) {
	return m.getByCodeFn(code)
}
func (m *mockMVCRepo) GetByEventID(eventID uuid.UUID) ([]models.MedalVerseCode, error) {
	return m.getByEventFn(eventID)
}
func (m *mockMVCRepo) Create(code *models.MedalVerseCode) error { return m.createFn(code) }
func (m *mockMVCRepo) Update(code *models.MedalVerseCode) error { return m.updateFn(code) }
func (m *mockMVCRepo) Delete(id uuid.UUID) error                { return m.deleteFn(id) }

func newMVCSvc(repo *mockMVCRepo) services.MedalVerseCodeService {
	return services.NewMedalVerseCodeService(repo)
}

// --- GetAll ---

func TestMVCService_GetAll_Success(t *testing.T) {
	codes := []models.MedalVerseCode{{Code: "ABC"}, {Code: "DEF"}}
	repo := &mockMVCRepo{
		getAllFn: func() ([]models.MedalVerseCode, error) { return codes, nil },
	}
	result, err := newMVCSvc(repo).GetAll()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(result) != 2 {
		t.Errorf("want 2, got %d", len(result))
	}
}

func TestMVCService_GetAll_Error(t *testing.T) {
	wantErr := errors.New("db error")
	repo := &mockMVCRepo{
		getAllFn: func() ([]models.MedalVerseCode, error) { return nil, wantErr },
	}
	_, err := newMVCSvc(repo).GetAll()
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

// --- GetByID ---

func TestMVCService_GetByID_Success(t *testing.T) {
	id := uuid.New()
	want := &models.MedalVerseCode{CodeID: id, Code: "TEST"}
	repo := &mockMVCRepo{
		getByIDFn: func(uid uuid.UUID) (*models.MedalVerseCode, error) { return want, nil },
	}
	got, err := newMVCSvc(repo).GetByID(id)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.Code != "TEST" {
		t.Errorf("Code: want TEST, got %s", got.Code)
	}
}

func TestMVCService_GetByID_NotFound(t *testing.T) {
	wantErr := errors.New("not found")
	repo := &mockMVCRepo{
		getByIDFn: func(id uuid.UUID) (*models.MedalVerseCode, error) { return nil, wantErr },
	}
	_, err := newMVCSvc(repo).GetByID(uuid.New())
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

// --- GetByCode ---

func TestMVCService_GetByCode_Success(t *testing.T) {
	want := &models.MedalVerseCode{Code: "HELLO"}
	repo := &mockMVCRepo{
		getByCodeFn: func(code string) (*models.MedalVerseCode, error) {
			if code != "HELLO" {
				t.Errorf("want code HELLO, got %s", code)
			}
			return want, nil
		},
	}
	got, err := newMVCSvc(repo).GetByCode("HELLO")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.Code != "HELLO" {
		t.Errorf("Code: want HELLO, got %s", got.Code)
	}
}

func TestMVCService_GetByCode_NotFound(t *testing.T) {
	wantErr := errors.New("not found")
	repo := &mockMVCRepo{
		getByCodeFn: func(code string) (*models.MedalVerseCode, error) { return nil, wantErr },
	}
	_, err := newMVCSvc(repo).GetByCode("NOPE")
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

// --- GetByEventID ---

func TestMVCService_GetByEventID_Success(t *testing.T) {
	eventID := uuid.New()
	codes := []models.MedalVerseCode{{Code: "A"}}
	repo := &mockMVCRepo{
		getByEventFn: func(eid uuid.UUID) ([]models.MedalVerseCode, error) {
			if eid != eventID {
				t.Errorf("expected eventID %v, got %v", eventID, eid)
			}
			return codes, nil
		},
	}
	got, err := newMVCSvc(repo).GetByEventID(eventID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(got) != 1 {
		t.Errorf("want 1, got %d", len(got))
	}
}

// --- Create ---

func TestMVCService_Create_Success(t *testing.T) {
	eventID := uuid.New()
	repo := &mockMVCRepo{
		createFn: func(code *models.MedalVerseCode) error { return nil },
	}
	expires := time.Now().Add(24 * time.Hour)
	req := services.CreateMedalVerseCodeRequest{
		Code:      "NEWCODE",
		EventID:   eventID,
		MaxUses:   10,
		ExpiresAt: &expires,
	}
	got, err := newMVCSvc(repo).Create(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.Code != "NEWCODE" {
		t.Errorf("Code: want NEWCODE, got %s", got.Code)
	}
	if !got.IsActive {
		t.Error("IsActive should default to true")
	}
	if got.MaxUses != 10 {
		t.Errorf("MaxUses: want 10, got %d", got.MaxUses)
	}
}

func TestMVCService_Create_RepoError(t *testing.T) {
	wantErr := errors.New("create failed")
	repo := &mockMVCRepo{
		createFn: func(code *models.MedalVerseCode) error { return wantErr },
	}
	_, err := newMVCSvc(repo).Create(services.CreateMedalVerseCodeRequest{
		Code: "X", EventID: uuid.New(),
	})
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

// --- Update ---

func TestMVCService_Update_Success(t *testing.T) {
	id := uuid.New()
	existing := &models.MedalVerseCode{CodeID: id, Code: "OLD", MaxUses: 5, IsActive: true}
	repo := &mockMVCRepo{
		getByIDFn: func(uid uuid.UUID) (*models.MedalVerseCode, error) { return existing, nil },
		updateFn:  func(code *models.MedalVerseCode) error { return nil },
	}

	newMax := 20
	inactive := false
	req := services.UpdateMedalVerseCodeRequest{
		Code:     "NEW",
		MaxUses:  &newMax,
		IsActive: &inactive,
	}
	got, err := newMVCSvc(repo).Update(id, req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.Code != "NEW" {
		t.Errorf("Code: want NEW, got %s", got.Code)
	}
	if got.MaxUses != 20 {
		t.Errorf("MaxUses: want 20, got %d", got.MaxUses)
	}
	if got.IsActive {
		t.Error("IsActive: want false")
	}
}

func TestMVCService_Update_PartialFields(t *testing.T) {
	id := uuid.New()
	existing := &models.MedalVerseCode{CodeID: id, Code: "KEEP", MaxUses: 5}
	repo := &mockMVCRepo{
		getByIDFn: func(uid uuid.UUID) (*models.MedalVerseCode, error) { return existing, nil },
		updateFn:  func(code *models.MedalVerseCode) error { return nil },
	}

	req := services.UpdateMedalVerseCodeRequest{Code: "CHANGED"}
	got, err := newMVCSvc(repo).Update(id, req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.Code != "CHANGED" {
		t.Errorf("Code: want CHANGED, got %s", got.Code)
	}
	if got.MaxUses != 5 {
		t.Errorf("MaxUses should remain 5, got %d", got.MaxUses)
	}
}

func TestMVCService_Update_GetByIDError(t *testing.T) {
	wantErr := errors.New("not found")
	repo := &mockMVCRepo{
		getByIDFn: func(id uuid.UUID) (*models.MedalVerseCode, error) { return nil, wantErr },
	}
	_, err := newMVCSvc(repo).Update(uuid.New(), services.UpdateMedalVerseCodeRequest{})
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

func TestMVCService_Update_RepoError(t *testing.T) {
	wantErr := errors.New("save failed")
	repo := &mockMVCRepo{
		getByIDFn: func(id uuid.UUID) (*models.MedalVerseCode, error) {
			return &models.MedalVerseCode{CodeID: id}, nil
		},
		updateFn: func(code *models.MedalVerseCode) error { return wantErr },
	}
	_, err := newMVCSvc(repo).Update(uuid.New(), services.UpdateMedalVerseCodeRequest{Code: "X"})
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

// --- Delete ---

func TestMVCService_Delete_Success(t *testing.T) {
	repo := &mockMVCRepo{
		deleteFn: func(id uuid.UUID) error { return nil },
	}
	if err := newMVCSvc(repo).Delete(uuid.New()); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestMVCService_Delete_Error(t *testing.T) {
	wantErr := errors.New("delete failed")
	repo := &mockMVCRepo{
		deleteFn: func(id uuid.UUID) error { return wantErr },
	}
	err := newMVCSvc(repo).Delete(uuid.New())
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}
