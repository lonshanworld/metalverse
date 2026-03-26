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

type mockEventRepo struct {
	getAllFn   func(page, pageSize int) ([]models.Event, int64, error)
	getByIDFn  func(id uuid.UUID) (*models.Event, error)
	getByOrgFn func(orgID uuid.UUID) ([]models.Event, error)
	createFn   func(event *models.Event) error
	updateFn   func(event *models.Event) error
	deleteFn   func(id uuid.UUID) error
}

func (m *mockEventRepo) GetAll(page, pageSize int) ([]models.Event, int64, error) {
	return m.getAllFn(page, pageSize)
}
func (m *mockEventRepo) GetByID(id uuid.UUID) (*models.Event, error) { return m.getByIDFn(id) }
func (m *mockEventRepo) GetByOrgID(orgID uuid.UUID) ([]models.Event, error) {
	return m.getByOrgFn(orgID)
}
func (m *mockEventRepo) Create(event *models.Event) error { return m.createFn(event) }
func (m *mockEventRepo) Update(event *models.Event) error { return m.updateFn(event) }
func (m *mockEventRepo) Delete(id uuid.UUID) error        { return m.deleteFn(id) }

func newEventSvc(repo *mockEventRepo) services.EventService {
	return services.NewEventService(repo)
}

// --- GetAll tests ---

func TestEventService_GetAll_Success(t *testing.T) {
	events := []models.Event{{Name: "E1"}, {Name: "E2"}}
	repo := &mockEventRepo{
		getAllFn: func(p, ps int) ([]models.Event, int64, error) {
			return events, 2, nil
		},
	}

	result, err := newEventSvc(repo).GetAll(1, 10)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(result.Data) != 2 {
		t.Errorf("want 2, got %d", len(result.Data))
	}
	if result.Total != 2 {
		t.Errorf("Total: want 2, got %d", result.Total)
	}
}

func TestEventService_GetAll_PaginationDefaults(t *testing.T) {
	cases := []struct {
		name         string
		page         int
		pageSize     int
		wantPage     int
		wantPageSize int
	}{
		{"page<1 clamped", 0, 10, 1, 10},
		{"pageSize<1 clamped", 1, 0, 1, 10},
		{"pageSize>100 clamped", 1, 101, 1, 10},
		{"negative page", -5, 10, 1, 10},
	}

	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			var gotPage, gotPS int
			repo := &mockEventRepo{
				getAllFn: func(p, ps int) ([]models.Event, int64, error) {
					gotPage = p
					gotPS = ps
					return nil, 0, nil
				},
			}
			_, err := newEventSvc(repo).GetAll(tc.page, tc.pageSize)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if gotPage != tc.wantPage {
				t.Errorf("page: want %d, got %d", tc.wantPage, gotPage)
			}
			if gotPS != tc.wantPageSize {
				t.Errorf("pageSize: want %d, got %d", tc.wantPageSize, gotPS)
			}
		})
	}
}

func TestEventService_GetAll_TotalPages(t *testing.T) {
	cases := []struct {
		total    int64
		pageSize int
		want     int64
	}{
		{10, 5, 2},
		{11, 5, 3},
		{0, 10, 0},
		{1, 10, 1},
	}
	for _, tc := range cases {
		repo := &mockEventRepo{
			getAllFn: func(p, ps int) ([]models.Event, int64, error) {
				return nil, tc.total, nil
			},
		}
		result, _ := newEventSvc(repo).GetAll(1, tc.pageSize)
		if result.TotalPages != tc.want {
			t.Errorf("total=%d pageSize=%d: want %d pages, got %d", tc.total, tc.pageSize, tc.want, result.TotalPages)
		}
	}
}

func TestEventService_GetAll_RepoError(t *testing.T) {
	wantErr := errors.New("db error")
	repo := &mockEventRepo{
		getAllFn: func(p, ps int) ([]models.Event, int64, error) { return nil, 0, wantErr },
	}
	_, err := newEventSvc(repo).GetAll(1, 10)
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

// --- GetByID ---

func TestEventService_GetByID_Success(t *testing.T) {
	id := uuid.New()
	want := &models.Event{EventID: id, Name: "Test"}
	repo := &mockEventRepo{
		getByIDFn: func(uid uuid.UUID) (*models.Event, error) { return want, nil },
	}
	got, err := newEventSvc(repo).GetByID(id)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.Name != "Test" {
		t.Errorf("Name: want Test, got %s", got.Name)
	}
}

func TestEventService_GetByID_NotFound(t *testing.T) {
	wantErr := errors.New("not found")
	repo := &mockEventRepo{
		getByIDFn: func(id uuid.UUID) (*models.Event, error) { return nil, wantErr },
	}
	_, err := newEventSvc(repo).GetByID(uuid.New())
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

// --- GetByOrgID ---

func TestEventService_GetByOrgID_Success(t *testing.T) {
	orgID := uuid.New()
	events := []models.Event{{Name: "E1"}}
	repo := &mockEventRepo{
		getByOrgFn: func(oid uuid.UUID) ([]models.Event, error) {
			if oid != orgID {
				t.Errorf("expected orgID %v, got %v", orgID, oid)
			}
			return events, nil
		},
	}
	got, err := newEventSvc(repo).GetByOrgID(orgID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(got) != 1 {
		t.Errorf("want 1, got %d", len(got))
	}
}

// --- Create ---

func TestEventService_Create_Success(t *testing.T) {
	orgID := uuid.New()
	repo := &mockEventRepo{
		createFn: func(event *models.Event) error { return nil },
	}

	req := services.CreateEventRequest{
		OrgID:    &orgID,
		Name:     "New Event",
		StartAt:  time.Now(),
		EndAt:    time.Now().Add(24 * time.Hour),
		Capacity: 100,
	}

	got, err := newEventSvc(repo).Create(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.Name != "New Event" {
		t.Errorf("Name: want New Event, got %s", got.Name)
	}
	if got.RemainingSeats != 100 {
		t.Errorf("RemainingSeats should equal Capacity: want 100, got %d", got.RemainingSeats)
	}
}

func TestEventService_Create_DefaultStatus(t *testing.T) {
	repo := &mockEventRepo{
		createFn: func(event *models.Event) error { return nil },
	}

	orgID := uuid.New()
	req := services.CreateEventRequest{
		OrgID:   &orgID,
		Name:    "E",
		StartAt: time.Now(),
		EndAt:   time.Now().Add(time.Hour),
	}
	got, err := newEventSvc(repo).Create(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.Status != "PENDING" {
		t.Errorf("default Status: want PENDING, got %s", got.Status)
	}
}

func TestEventService_Create_CustomStatus(t *testing.T) {
	repo := &mockEventRepo{
		createFn: func(event *models.Event) error { return nil },
	}
	orgID := uuid.New()
	req := services.CreateEventRequest{
		OrgID:   &orgID,
		Name:    "E",
		StartAt: time.Now(),
		EndAt:   time.Now().Add(time.Hour),
		Status:  "PUBLISHED",
	}
	got, _ := newEventSvc(repo).Create(req)
	if got.Status != "PUBLISHED" {
		t.Errorf("Status: want PUBLISHED, got %s", got.Status)
	}
}

func TestEventService_Create_RepoError(t *testing.T) {
	wantErr := errors.New("create failed")
	repo := &mockEventRepo{
		createFn: func(event *models.Event) error { return wantErr },
	}
	orgID := uuid.New()
	_, err := newEventSvc(repo).Create(services.CreateEventRequest{
		OrgID: &orgID, Name: "E", StartAt: time.Now(), EndAt: time.Now().Add(time.Hour),
	})
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

// --- Update ---

func TestEventService_Update_Success(t *testing.T) {
	id := uuid.New()
	existing := &models.Event{EventID: id, Name: "Old", Status: "PENDING"}
	repo := &mockEventRepo{
		getByIDFn: func(uid uuid.UUID) (*models.Event, error) { return existing, nil },
		updateFn:  func(event *models.Event) error { return nil },
	}

	cap := 50
	sponsored := true
	req := services.UpdateEventRequest{
		Name:        "Updated",
		Status:      "PUBLISHED",
		Capacity:    &cap,
		IsSponsored: &sponsored,
	}
	got, err := newEventSvc(repo).Update(id, req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.Name != "Updated" {
		t.Errorf("Name: want Updated, got %s", got.Name)
	}
	if got.Status != "PUBLISHED" {
		t.Errorf("Status: want PUBLISHED, got %s", got.Status)
	}
	if got.Capacity != 50 {
		t.Errorf("Capacity: want 50, got %d", got.Capacity)
	}
	if !got.IsSponsored {
		t.Error("IsSponsored: want true")
	}
}

func TestEventService_Update_GetByIDError(t *testing.T) {
	wantErr := errors.New("not found")
	repo := &mockEventRepo{
		getByIDFn: func(id uuid.UUID) (*models.Event, error) { return nil, wantErr },
	}
	_, err := newEventSvc(repo).Update(uuid.New(), services.UpdateEventRequest{})
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

func TestEventService_Update_RepoError(t *testing.T) {
	wantErr := errors.New("save failed")
	repo := &mockEventRepo{
		getByIDFn: func(id uuid.UUID) (*models.Event, error) { return &models.Event{EventID: id}, nil },
		updateFn:  func(event *models.Event) error { return wantErr },
	}
	_, err := newEventSvc(repo).Update(uuid.New(), services.UpdateEventRequest{Name: "X"})
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

// --- Delete ---

func TestEventService_Delete_Success(t *testing.T) {
	repo := &mockEventRepo{
		deleteFn: func(id uuid.UUID) error { return nil },
	}
	if err := newEventSvc(repo).Delete(uuid.New()); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestEventService_Delete_Error(t *testing.T) {
	wantErr := errors.New("delete failed")
	repo := &mockEventRepo{
		deleteFn: func(id uuid.UUID) error { return wantErr },
	}
	err := newEventSvc(repo).Delete(uuid.New())
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}
