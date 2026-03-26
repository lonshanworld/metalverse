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

// --- mock service ---

type mockOrgService struct {
	getAllFn  func() ([]models.Organization, error)
	getByIDFn func(id uuid.UUID) (*models.Organization, error)
	createFn  func(req services.CreateOrganizationRequest) (*models.Organization, error)
	updateFn  func(id uuid.UUID, req services.UpdateOrganizationRequest) (*models.Organization, error)
	deleteFn  func(id uuid.UUID) error
}

func (m *mockOrgService) GetAll() ([]models.Organization, error) { return m.getAllFn() }
func (m *mockOrgService) GetByID(id uuid.UUID) (*models.Organization, error) {
	return m.getByIDFn(id)
}
func (m *mockOrgService) Create(req services.CreateOrganizationRequest) (*models.Organization, error) {
	return m.createFn(req)
}
func (m *mockOrgService) Update(id uuid.UUID, req services.UpdateOrganizationRequest) (*models.Organization, error) {
	return m.updateFn(id, req)
}
func (m *mockOrgService) Delete(id uuid.UUID) error { return m.deleteFn(id) }

func newOrgTestRouter(svc services.OrganizationService) *gin.Engine {
	r := gin.New()
	h := handlers.NewOrganizationHandler(svc)
	r.GET("/organizations", h.List)
	r.GET("/organizations/:id", h.Get)
	r.POST("/organizations", h.Create)
	r.PUT("/organizations/:id", h.Update)
	r.DELETE("/organizations/:id", h.Delete)
	return r
}

// --- List ---

func TestOrgHandler_List_Success(t *testing.T) {
	svc := &mockOrgService{
		getAllFn: func() ([]models.Organization, error) {
			return []models.Organization{{Name: "Org"}}, nil
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/organizations", nil)
	newOrgTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestOrgHandler_List_ServiceError(t *testing.T) {
	svc := &mockOrgService{
		getAllFn: func() ([]models.Organization, error) { return nil, errors.New("fail") },
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/organizations", nil)
	newOrgTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status: want 500, got %d", w.Code)
	}
}

// --- Get ---

func TestOrgHandler_Get_Success(t *testing.T) {
	id := uuid.New()
	svc := &mockOrgService{
		getByIDFn: func(uid uuid.UUID) (*models.Organization, error) {
			return &models.Organization{OrgID: uid, Name: "Test"}, nil
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/organizations/"+id.String(), nil)
	newOrgTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestOrgHandler_Get_InvalidID(t *testing.T) {
	svc := &mockOrgService{}
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/organizations/bad", nil)
	newOrgTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: want 400, got %d", w.Code)
	}
}

func TestOrgHandler_Get_NotFound(t *testing.T) {
	svc := &mockOrgService{
		getByIDFn: func(id uuid.UUID) (*models.Organization, error) { return nil, errors.New("not found") },
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/organizations/"+uuid.New().String(), nil)
	newOrgTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status: want 404, got %d", w.Code)
	}
}

// --- Create ---

func TestOrgHandler_Create_Success(t *testing.T) {
	svc := &mockOrgService{
		createFn: func(req services.CreateOrganizationRequest) (*models.Organization, error) {
			return &models.Organization{Name: req.Name}, nil
		},
	}

	body, _ := json.Marshal(services.CreateOrganizationRequest{Name: "New Org"})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/organizations", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	newOrgTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("status: want 201, got %d", w.Code)
	}
}

func TestOrgHandler_Create_BadRequest(t *testing.T) {
	svc := &mockOrgService{}
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/organizations", bytes.NewReader([]byte("{}")))
	req.Header.Set("Content-Type", "application/json")
	newOrgTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: want 400, got %d", w.Code)
	}
}

func TestOrgHandler_Create_ServiceError(t *testing.T) {
	svc := &mockOrgService{
		createFn: func(req services.CreateOrganizationRequest) (*models.Organization, error) {
			return nil, errors.New("fail")
		},
	}

	body, _ := json.Marshal(services.CreateOrganizationRequest{Name: "X"})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/organizations", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	newOrgTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status: want 500, got %d", w.Code)
	}
}

// --- Update ---

func TestOrgHandler_Update_Success(t *testing.T) {
	id := uuid.New()
	svc := &mockOrgService{
		updateFn: func(uid uuid.UUID, req services.UpdateOrganizationRequest) (*models.Organization, error) {
			return &models.Organization{OrgID: uid, Name: req.Name}, nil
		},
	}

	body, _ := json.Marshal(services.UpdateOrganizationRequest{Name: "Updated"})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/organizations/"+id.String(), bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	newOrgTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestOrgHandler_Update_InvalidID(t *testing.T) {
	svc := &mockOrgService{}
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/organizations/bad", bytes.NewReader([]byte("{}")))
	req.Header.Set("Content-Type", "application/json")
	newOrgTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: want 400, got %d", w.Code)
	}
}

func TestOrgHandler_Update_ServiceError(t *testing.T) {
	svc := &mockOrgService{
		updateFn: func(id uuid.UUID, req services.UpdateOrganizationRequest) (*models.Organization, error) {
			return nil, errors.New("fail")
		},
	}

	body, _ := json.Marshal(services.UpdateOrganizationRequest{Name: "X"})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/organizations/"+uuid.New().String(), bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	newOrgTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status: want 500, got %d", w.Code)
	}
}

// --- Delete ---

func TestOrgHandler_Delete_Success(t *testing.T) {
	svc := &mockOrgService{
		deleteFn: func(id uuid.UUID) error { return nil },
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/organizations/"+uuid.New().String(), nil)
	newOrgTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestOrgHandler_Delete_InvalidID(t *testing.T) {
	svc := &mockOrgService{}
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/organizations/bad", nil)
	newOrgTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: want 400, got %d", w.Code)
	}
}

func TestOrgHandler_Delete_ServiceError(t *testing.T) {
	svc := &mockOrgService{
		deleteFn: func(id uuid.UUID) error { return errors.New("fail") },
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/organizations/"+uuid.New().String(), nil)
	newOrgTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status: want 500, got %d", w.Code)
	}
}
