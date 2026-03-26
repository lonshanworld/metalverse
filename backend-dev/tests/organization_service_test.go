package tests

import (
	"errors"
	"testing"

	"medalverse-be/internal/models"
	"medalverse-be/internal/services"

	"github.com/google/uuid"
)

// --- mock repository ---

type mockOrgRepo struct {
	getAllFn  func() ([]models.Organization, error)
	getByIDFn func(id uuid.UUID) (*models.Organization, error)
	createFn  func(org *models.Organization) error
	updateFn  func(org *models.Organization) error
	deleteFn  func(id uuid.UUID) error
}

func (m *mockOrgRepo) GetAll() ([]models.Organization, error) { return m.getAllFn() }
func (m *mockOrgRepo) GetByID(id uuid.UUID) (*models.Organization, error) {
	return m.getByIDFn(id)
}
func (m *mockOrgRepo) Create(org *models.Organization) error { return m.createFn(org) }
func (m *mockOrgRepo) Update(org *models.Organization) error { return m.updateFn(org) }
func (m *mockOrgRepo) Delete(id uuid.UUID) error             { return m.deleteFn(id) }

func newOrgSvc(repo *mockOrgRepo) services.OrganizationService {
	return services.NewOrganizationService(repo)
}

// --- GetAll ---

func TestOrgService_GetAll_Success(t *testing.T) {
	orgs := []models.Organization{{Name: "Org A"}, {Name: "Org B"}}
	repo := &mockOrgRepo{
		getAllFn: func() ([]models.Organization, error) { return orgs, nil },
	}

	result, err := newOrgSvc(repo).GetAll()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(result) != 2 {
		t.Errorf("want 2, got %d", len(result))
	}
}

func TestOrgService_GetAll_Error(t *testing.T) {
	wantErr := errors.New("db error")
	repo := &mockOrgRepo{
		getAllFn: func() ([]models.Organization, error) { return nil, wantErr },
	}
	_, err := newOrgSvc(repo).GetAll()
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

// --- GetByID ---

func TestOrgService_GetByID_Success(t *testing.T) {
	id := uuid.New()
	want := &models.Organization{OrgID: id, Name: "Test Org"}
	repo := &mockOrgRepo{
		getByIDFn: func(uid uuid.UUID) (*models.Organization, error) { return want, nil },
	}

	got, err := newOrgSvc(repo).GetByID(id)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.Name != "Test Org" {
		t.Errorf("Name: want Test Org, got %s", got.Name)
	}
}

func TestOrgService_GetByID_NotFound(t *testing.T) {
	wantErr := errors.New("not found")
	repo := &mockOrgRepo{
		getByIDFn: func(id uuid.UUID) (*models.Organization, error) { return nil, wantErr },
	}
	_, err := newOrgSvc(repo).GetByID(uuid.New())
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

// --- Create ---

func TestOrgService_Create_Success(t *testing.T) {
	repo := &mockOrgRepo{
		createFn: func(org *models.Organization) error { return nil },
	}

	req := services.CreateOrganizationRequest{
		Name:        "New Org",
		Description: "Desc",
		Website:     "https://example.com",
	}
	got, err := newOrgSvc(repo).Create(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.Name != "New Org" {
		t.Errorf("Name: want New Org, got %s", got.Name)
	}
	if !got.IsActive {
		t.Error("IsActive should default to true")
	}
}

func TestOrgService_Create_RepoError(t *testing.T) {
	wantErr := errors.New("create failed")
	repo := &mockOrgRepo{
		createFn: func(org *models.Organization) error { return wantErr },
	}
	_, err := newOrgSvc(repo).Create(services.CreateOrganizationRequest{Name: "X"})
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

// --- Update ---

func TestOrgService_Update_Success(t *testing.T) {
	id := uuid.New()
	existing := &models.Organization{OrgID: id, Name: "Old", IsActive: true}
	repo := &mockOrgRepo{
		getByIDFn: func(uid uuid.UUID) (*models.Organization, error) { return existing, nil },
		updateFn:  func(org *models.Organization) error { return nil },
	}

	inactive := false
	req := services.UpdateOrganizationRequest{
		Name:     "Updated",
		Website:  "https://new.com",
		IsActive: &inactive,
	}
	got, err := newOrgSvc(repo).Update(id, req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.Name != "Updated" {
		t.Errorf("Name: want Updated, got %s", got.Name)
	}
	if got.Website != "https://new.com" {
		t.Errorf("Website: want https://new.com, got %s", got.Website)
	}
	if got.IsActive {
		t.Error("IsActive: want false")
	}
}

func TestOrgService_Update_PartialFields(t *testing.T) {
	id := uuid.New()
	existing := &models.Organization{OrgID: id, Name: "Keep", Description: "Keep Desc"}
	repo := &mockOrgRepo{
		getByIDFn: func(uid uuid.UUID) (*models.Organization, error) { return existing, nil },
		updateFn:  func(org *models.Organization) error { return nil },
	}

	req := services.UpdateOrganizationRequest{Name: "Changed"}
	got, err := newOrgSvc(repo).Update(id, req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.Name != "Changed" {
		t.Errorf("Name: want Changed, got %s", got.Name)
	}
	if got.Description != "Keep Desc" {
		t.Errorf("Description should remain, got %s", got.Description)
	}
}

func TestOrgService_Update_GetByIDError(t *testing.T) {
	wantErr := errors.New("not found")
	repo := &mockOrgRepo{
		getByIDFn: func(id uuid.UUID) (*models.Organization, error) { return nil, wantErr },
	}
	_, err := newOrgSvc(repo).Update(uuid.New(), services.UpdateOrganizationRequest{})
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

func TestOrgService_Update_RepoError(t *testing.T) {
	wantErr := errors.New("save failed")
	repo := &mockOrgRepo{
		getByIDFn: func(id uuid.UUID) (*models.Organization, error) {
			return &models.Organization{OrgID: id}, nil
		},
		updateFn: func(org *models.Organization) error { return wantErr },
	}
	_, err := newOrgSvc(repo).Update(uuid.New(), services.UpdateOrganizationRequest{Name: "X"})
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

// --- Delete ---

func TestOrgService_Delete_Success(t *testing.T) {
	repo := &mockOrgRepo{
		deleteFn: func(id uuid.UUID) error { return nil },
	}
	if err := newOrgSvc(repo).Delete(uuid.New()); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestOrgService_Delete_Error(t *testing.T) {
	wantErr := errors.New("delete failed")
	repo := &mockOrgRepo{
		deleteFn: func(id uuid.UUID) error { return wantErr },
	}
	err := newOrgSvc(repo).Delete(uuid.New())
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}
