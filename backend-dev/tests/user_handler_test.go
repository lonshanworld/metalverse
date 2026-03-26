package tests

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"medalverse-be/internal/handlers"
	"medalverse-be/internal/models"
	"medalverse-be/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type mockUserService struct {
	getAllFn   func() ([]models.User, error)
	getByIDFn  func(id uuid.UUID) (*models.User, error)
	getByEmail func(email string) (*models.User, error)
	updateFn   func(id uuid.UUID, req services.UpdateUserRequest) (*models.User, error)
	deleteFn   func(id uuid.UUID) error
}

func (m *mockUserService) GetAll() ([]models.User, error) { return m.getAllFn() }
func (m *mockUserService) GetByID(id uuid.UUID) (*models.User, error) {
	return m.getByIDFn(id)
}
func (m *mockUserService) GetByEmail(email string) (*models.User, error) {
	if m.getByEmail != nil {
		return m.getByEmail(email)
	}
	return nil, nil // basic default
}
func (m *mockUserService) Update(id uuid.UUID, req services.UpdateUserRequest) (*models.User, error) {
	return m.updateFn(id, req)
}
func (m *mockUserService) Delete(id uuid.UUID) error { return m.deleteFn(id) }

func newUserTestRouter(svc services.UserService) *gin.Engine {
	r := gin.New()
	h := handlers.NewUserHandler(svc)
	r.GET("/users/email", h.GetByEmail) // must be before /:id to avoid shadowing
	r.GET("/users", h.List)
	r.GET("/users/:id", h.Get)
	r.PUT("/users/:id", h.Update)
	r.DELETE("/users/:id", h.Delete)
	return r
}

// --- List ---

func TestUserHandler_List_Success(t *testing.T) {
	users := []models.User{{UserID: uuid.New(), Email: "a@x.com"}}
	svc := &mockUserService{
		getAllFn: func() ([]models.User, error) { return users, nil },
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/users", nil)
	newUserTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestUserHandler_List_ServiceError(t *testing.T) {
	svc := &mockUserService{
		getAllFn: func() ([]models.User, error) { return nil, errors.New("db error") },
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/users", nil)
	newUserTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status: want 500, got %d", w.Code)
	}
}

// --- Get ---

func TestUserHandler_Get_Success(t *testing.T) {
	id := uuid.New()
	svc := &mockUserService{
		getByIDFn: func(uid uuid.UUID) (*models.User, error) {
			return &models.User{UserID: uid, Email: "a@x.com"}, nil
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/users/"+id.String(), nil)
	newUserTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestUserHandler_Get_InvalidID(t *testing.T) {
	svc := &mockUserService{}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/users/not-a-uuid", nil)
	newUserTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: want 400, got %d", w.Code)
	}
}

func TestUserHandler_Get_NotFound(t *testing.T) {
	svc := &mockUserService{
		getByIDFn: func(id uuid.UUID) (*models.User, error) { return nil, errors.New("not found") },
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/users/"+uuid.New().String(), nil)
	newUserTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status: want 404, got %d", w.Code)
	}
}

// --- Update ---

func TestUserHandler_Update_Success(t *testing.T) {
	id := uuid.New()
	svc := &mockUserService{
		updateFn: func(uid uuid.UUID, req services.UpdateUserRequest) (*models.User, error) {
			return &models.User{UserID: uid, IsActive: *req.IsActive}, nil
		},
	}

	isActive := false
	body, _ := json.Marshal(services.UpdateUserRequest{IsActive: &isActive})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/users/"+id.String(), bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	newUserTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestUserHandler_Update_InvalidID(t *testing.T) {
	svc := &mockUserService{}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/users/bad-id", bytes.NewReader([]byte("{}")))
	req.Header.Set("Content-Type", "application/json")
	newUserTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: want 400, got %d", w.Code)
	}
}

func TestUserHandler_Update_ServiceError(t *testing.T) {
	svc := &mockUserService{
		updateFn: func(id uuid.UUID, req services.UpdateUserRequest) (*models.User, error) {
			return nil, errors.New("fail")
		},
	}

	isActive := true
	body, _ := json.Marshal(services.UpdateUserRequest{IsActive: &isActive})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/users/"+uuid.New().String(), bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	newUserTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status: want 500, got %d", w.Code)
	}
}

// --- Delete ---

func TestUserHandler_Delete_Success(t *testing.T) {
	svc := &mockUserService{
		deleteFn: func(id uuid.UUID) error { return nil },
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/users/"+uuid.New().String(), nil)
	newUserTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestUserHandler_Delete_InvalidID(t *testing.T) {
	svc := &mockUserService{}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/users/bad", nil)
	newUserTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: want 400, got %d", w.Code)
	}
}

func TestUserHandler_Delete_ServiceError(t *testing.T) {
	svc := &mockUserService{
		deleteFn: func(id uuid.UUID) error { return errors.New("fail") },
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/users/"+uuid.New().String(), nil)
	newUserTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status: want 500, got %d", w.Code)
	}
}

func TestUserHandler_GetByEmail_Success(t *testing.T) {
	want := &models.User{UserID: uuid.New(), Email: "yodpeth.pah@gmail.com"}
	svc := &mockUserService{
		getByEmail: func(email string) (*models.User, error) {
			if email != "yodpeth.pah@gmail.com" {
				t.Errorf("email: want yodpeth.pah@gmail.com, got %s", email)
			}
			return want, nil
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/users/email?email=yodpeth.pah@gmail.com", nil)
	newUserTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}

	var got models.User
	if err := json.NewDecoder(w.Body).Decode(&got); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if got.Email != want.Email {
		t.Errorf("email: want %s, got %s", want.Email, got.Email)
	}
}

func TestUserHandler_GetByEmail_NotFound(t *testing.T) {
	svc := &mockUserService{
		getByEmail: func(email string) (*models.User, error) {
			return nil, errors.New("record not found")
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/users/email?email=ghost@x.com", nil)
	newUserTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status: want 404, got %d", w.Code)
	}
}

func TestUserHandler_GetByEmail_MissingParam(t *testing.T) {
	svc := &mockUserService{}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/users/email", nil)
	newUserTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: want 400, got %d", w.Code)
	}
}

func TestUserHandler_GetByEmail_DBColumnMissing(t *testing.T) {
	svc := &mockUserService{
		getByEmail: func(email string) (*models.User, error) {
			return nil, errors.New(`pq: column "is_email_verified" does not exist`)
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/users/email?email=yodpeth.pah@gmail.com", nil)
	newUserTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status: want 404 (DB error should not leak as 500), got %d", w.Code)
	}
}
