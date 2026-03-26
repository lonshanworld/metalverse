package tests

import (
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

func init() {
	gin.SetMode(gin.TestMode)
}

// --- mock service ---

type mockCredentialService struct {
	getPaginatedFn func(page, pageSize int) (*services.PaginatedCredentials, error)
	getAllFn       func() ([]models.Credential, error)
	getByIDFn      func(id uuid.UUID) (*models.Credential, error)
	getByUserIDFn  func(userID uuid.UUID) ([]models.Credential, error)
	getByEventIDFn func(eventID uuid.UUID) ([]models.Credential, error)
	createFn       func(req services.CreateCredentialRequest) (*models.Credential, error)
	updateFn       func(id uuid.UUID, req services.UpdateCredentialRequest) (*models.Credential, error)
	deleteFn       func(id uuid.UUID) error
}

func (m *mockCredentialService) GetAll() ([]models.Credential, error) { return m.getAllFn() }
func (m *mockCredentialService) GetPaginated(page, pageSize int) (*services.PaginatedCredentials, error) {
	return m.getPaginatedFn(page, pageSize)
}
func (m *mockCredentialService) GetByID(id uuid.UUID) (*models.Credential, error) {
	return m.getByIDFn(id)
}
func (m *mockCredentialService) GetByUserID(userID uuid.UUID) ([]models.Credential, error) {
	return m.getByUserIDFn(userID)
}
func (m *mockCredentialService) GetByEventID(eventID uuid.UUID) ([]models.Credential, error) {
	if m.getByEventIDFn != nil {
		return m.getByEventIDFn(eventID)
	}
	return nil, nil
}
func (m *mockCredentialService) Create(req services.CreateCredentialRequest) (*models.Credential, error) {
	return m.createFn(req)
}
func (m *mockCredentialService) Update(id uuid.UUID, req services.UpdateCredentialRequest) (*models.Credential, error) {
	return m.updateFn(id, req)
}
func (m *mockCredentialService) Delete(id uuid.UUID) error { return m.deleteFn(id) }

// helper: builds a test router with only the List handler

func newCredentialTestRouter(svc services.CredentialService) *gin.Engine {
	r := gin.New()
	h := handlers.NewCredentialHandler(svc)
	r.GET("/credentials", h.List)
	return r
}

// --- tests ---

func TestListHandler_DefaultPagination(t *testing.T) {
	var gotPage, gotPageSize int
	svc := &mockCredentialService{
		getPaginatedFn: func(page, pageSize int) (*services.PaginatedCredentials, error) {
			gotPage = page
			gotPageSize = pageSize
			return &services.PaginatedCredentials{
				Data: []models.Credential{}, Total: 0, Page: page, PageSize: pageSize,
			}, nil
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/credentials", nil)
	newCredentialTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
	if gotPage != 1 {
		t.Errorf("default page: want 1, got %d", gotPage)
	}
	if gotPageSize != 10 {
		t.Errorf("default page_size: want 10, got %d", gotPageSize)
	}
}

func TestListHandler_CustomPagination(t *testing.T) {
	var gotPage, gotPageSize int
	svc := &mockCredentialService{
		getPaginatedFn: func(page, pageSize int) (*services.PaginatedCredentials, error) {
			gotPage = page
			gotPageSize = pageSize
			return &services.PaginatedCredentials{
				Data:       make([]models.Credential, pageSize),
				Total:      50,
				Page:       page,
				PageSize:   pageSize,
				TotalPages: 5,
			}, nil
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/credentials?page=3&page_size=5", nil)
	newCredentialTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status: want 200, got %d", w.Code)
	}
	if gotPage != 3 {
		t.Errorf("page: want 3, got %d", gotPage)
	}
	if gotPageSize != 5 {
		t.Errorf("page_size: want 5, got %d", gotPageSize)
	}

	var body services.PaginatedCredentials
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	if body.Total != 50 {
		t.Errorf("Total: want 50, got %d", body.Total)
	}
	if body.TotalPages != 5 {
		t.Errorf("TotalPages: want 5, got %d", body.TotalPages)
	}
	if len(body.Data) != 5 {
		t.Errorf("Data length: want 5, got %d", len(body.Data))
	}
}

func TestListHandler_ResponseShape(t *testing.T) {
	creds := []models.Credential{
		{CredentialID: uuid.New(), Name: "Medal A"},
		{CredentialID: uuid.New(), Name: "Medal B"},
	}
	svc := &mockCredentialService{
		getPaginatedFn: func(page, pageSize int) (*services.PaginatedCredentials, error) {
			return &services.PaginatedCredentials{
				Data: creds, Total: 2, Page: 1, PageSize: 10, TotalPages: 1,
			}, nil
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/credentials", nil)
	newCredentialTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status: want 200, got %d", w.Code)
	}

	var body map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	for _, key := range []string{"data", "total", "page", "page_size", "total_pages"} {
		if _, ok := body[key]; !ok {
			t.Errorf("response missing key %q", key)
		}
	}
	dataSlice, ok := body["data"].([]interface{})
	if !ok {
		t.Fatal("data is not an array")
	}
	if len(dataSlice) != 2 {
		t.Errorf("data length: want 2, got %d", len(dataSlice))
	}
}

func TestListHandler_ServiceError_Returns500(t *testing.T) {
	svc := &mockCredentialService{
		getPaginatedFn: func(page, pageSize int) (*services.PaginatedCredentials, error) {
			return nil, errors.New("database unavailable")
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/credentials", nil)
	newCredentialTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status: want 500, got %d", w.Code)
	}
	var body map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if _, ok := body["error"]; !ok {
		t.Error("response body missing 'error' key")
	}
}

func TestListHandler_InvalidPageParam_IgnoredGracefully(t *testing.T) {
	svc := &mockCredentialService{
		getPaginatedFn: func(page, pageSize int) (*services.PaginatedCredentials, error) {
			return &services.PaginatedCredentials{
				Data: []models.Credential{}, Total: 0, Page: page, PageSize: pageSize,
			}, nil
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/credentials?page=abc&page_size=xyz", nil)
	newCredentialTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}
