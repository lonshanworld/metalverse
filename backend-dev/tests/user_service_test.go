package tests

import (
	"errors"
	"testing"

	"medalverse-be/internal/models"
	"medalverse-be/internal/services"

	"github.com/google/uuid"
)

type mockUserRepo struct {
	getAllFn   func() ([]models.User, error)
	getByIDFn  func(id uuid.UUID) (*models.User, error)
	getByEmail func(email string) (*models.User, error)
	createFn   func(user *models.User) error
	updateFn   func(user *models.User) error
	deleteFn   func(id uuid.UUID) error
}

func (m *mockUserRepo) GetAll() ([]models.User, error) { return m.getAllFn() }
func (m *mockUserRepo) GetByID(id uuid.UUID) (*models.User, error) {
	return m.getByIDFn(id)
}
func (m *mockUserRepo) GetByEmail(email string) (*models.User, error) {
	return m.getByEmail(email)
}
func (m *mockUserRepo) Create(user *models.User) error { return m.createFn(user) }
func (m *mockUserRepo) Update(user *models.User) error { return m.updateFn(user) }
func (m *mockUserRepo) Delete(id uuid.UUID) error      { return m.deleteFn(id) }

func newUserSvc(repo *mockUserRepo) services.UserService {
	return services.NewUserService(repo)
}

// --- tests ---

func TestUserService_GetAll_Success(t *testing.T) {
	users := []models.User{
		{UserID: uuid.New(), Email: "a@x.com"},
		{UserID: uuid.New(), Email: "b@x.com"},
	}
	repo := &mockUserRepo{
		getAllFn: func() ([]models.User, error) { return users, nil },
	}

	result, err := newUserSvc(repo).GetAll()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(result) != 2 {
		t.Errorf("want 2 users, got %d", len(result))
	}
}

func TestUserService_GetAll_Error(t *testing.T) {
	wantErr := errors.New("db down")
	repo := &mockUserRepo{
		getAllFn: func() ([]models.User, error) { return nil, wantErr },
	}

	_, err := newUserSvc(repo).GetAll()
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

func TestUserService_GetByID_Success(t *testing.T) {
	id := uuid.New()
	want := &models.User{UserID: id, Email: "a@x.com"}
	repo := &mockUserRepo{
		getByIDFn: func(uid uuid.UUID) (*models.User, error) {
			if uid != id {
				t.Errorf("expected id %v, got %v", id, uid)
			}
			return want, nil
		},
	}

	got, err := newUserSvc(repo).GetByID(id)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.UserID != want.UserID {
		t.Errorf("UserID: want %v, got %v", want.UserID, got.UserID)
	}
}

func TestUserService_GetByID_NotFound(t *testing.T) {
	wantErr := errors.New("record not found")
	repo := &mockUserRepo{
		getByIDFn: func(id uuid.UUID) (*models.User, error) { return nil, wantErr },
	}

	_, err := newUserSvc(repo).GetByID(uuid.New())
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

func TestUserService_Update_Success(t *testing.T) {
	id := uuid.New()
	existing := &models.User{UserID: id, IsActive: true}

	repo := &mockUserRepo{
		getByIDFn: func(uid uuid.UUID) (*models.User, error) { return existing, nil },
		updateFn:  func(user *models.User) error { return nil },
	}

	isActive := false
	req := services.UpdateUserRequest{
		IsActive: &isActive,
	}

	got, err := newUserSvc(repo).Update(id, req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.IsActive != false {
		t.Errorf("IsActive: want false, got %v", got.IsActive)
	}
}

func TestUserService_Update_PartialFields(t *testing.T) {
	id := uuid.New()
	existing := &models.User{UserID: id, IsActive: true}

	repo := &mockUserRepo{
		getByIDFn: func(uid uuid.UUID) (*models.User, error) { return existing, nil },
		updateFn:  func(user *models.User) error { return nil },
	}

	isActive := false
	req := services.UpdateUserRequest{IsActive: &isActive}

	got, err := newUserSvc(repo).Update(id, req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.IsActive != false {
		t.Errorf("IsActive: want false, got %v", got.IsActive)
	}
}

func TestUserService_Update_GetByIDError(t *testing.T) {
	wantErr := errors.New("not found")
	repo := &mockUserRepo{
		getByIDFn: func(id uuid.UUID) (*models.User, error) { return nil, wantErr },
	}

	_, err := newUserSvc(repo).Update(uuid.New(), services.UpdateUserRequest{})
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

func TestUserService_Update_RepoError(t *testing.T) {
	wantErr := errors.New("save failed")
	repo := &mockUserRepo{
		getByIDFn: func(id uuid.UUID) (*models.User, error) {
			return &models.User{UserID: id}, nil
		},
		updateFn: func(user *models.User) error { return wantErr },
	}

	_, err := newUserSvc(repo).Update(uuid.New(), services.UpdateUserRequest{Password: "X"})
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}

func TestUserService_Update_WithPassword(t *testing.T) {
	id := uuid.New()
	oldPW := "old"
	existing := &models.User{UserID: id, Password: &oldPW}

	repo := &mockUserRepo{
		getByIDFn: func(uid uuid.UUID) (*models.User, error) { return existing, nil },
		updateFn:  func(user *models.User) error { return nil },
	}

	req := services.UpdateUserRequest{Password: "new_password"}
	got, err := newUserSvc(repo).Update(id, req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.Password != nil && (*got.Password == "old" || *got.Password == "new_password") {
		t.Error("password should be hashed, not stored as raw/old")
	}
	if got.Password == nil || *got.Password == "" {
		t.Error("password should not be empty after update")
	}
}

func TestUserService_Delete_Success(t *testing.T) {
	id := uuid.New()
	called := false
	repo := &mockUserRepo{
		deleteFn: func(uid uuid.UUID) error {
			called = true
			if uid != id {
				t.Errorf("expected id %v, got %v", id, uid)
			}
			return nil
		},
	}

	err := newUserSvc(repo).Delete(id)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !called {
		t.Error("repo.Delete was not called")
	}
}

func TestUserService_Delete_Error(t *testing.T) {
	wantErr := errors.New("delete failed")
	repo := &mockUserRepo{
		deleteFn: func(id uuid.UUID) error { return wantErr },
	}

	err := newUserSvc(repo).Delete(uuid.New())
	if !errors.Is(err, wantErr) {
		t.Errorf("want %v, got %v", wantErr, err)
	}
}
