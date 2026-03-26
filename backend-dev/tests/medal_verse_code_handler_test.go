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

type mockMVCService struct {
	getAllFn     func() ([]models.MedalVerseCode, error)
	getByIDFn    func(id uuid.UUID) (*models.MedalVerseCode, error)
	getByCodeFn  func(code string) (*models.MedalVerseCode, error)
	getByEventFn func(eventID uuid.UUID) ([]models.MedalVerseCode, error)
	createFn     func(req services.CreateMedalVerseCodeRequest) (*models.MedalVerseCode, error)
	updateFn     func(id uuid.UUID, req services.UpdateMedalVerseCodeRequest) (*models.MedalVerseCode, error)
	deleteFn     func(id uuid.UUID) error
}

func (m *mockMVCService) GetAll() ([]models.MedalVerseCode, error) { return m.getAllFn() }
func (m *mockMVCService) GetByID(id uuid.UUID) (*models.MedalVerseCode, error) {
	return m.getByIDFn(id)
}
func (m *mockMVCService) GetByCode(code string) (*models.MedalVerseCode, error) {
	return m.getByCodeFn(code)
}
func (m *mockMVCService) GetByEventID(eventID uuid.UUID) ([]models.MedalVerseCode, error) {
	return m.getByEventFn(eventID)
}
func (m *mockMVCService) Create(req services.CreateMedalVerseCodeRequest) (*models.MedalVerseCode, error) {
	return m.createFn(req)
}
func (m *mockMVCService) Update(id uuid.UUID, req services.UpdateMedalVerseCodeRequest) (*models.MedalVerseCode, error) {
	return m.updateFn(id, req)
}
func (m *mockMVCService) Delete(id uuid.UUID) error { return m.deleteFn(id) }

func newMVCTestRouter(svc services.MedalVerseCodeService) *gin.Engine {
	r := gin.New()
	h := handlers.NewMedalVerseCodeHandler(svc)
	r.GET("/codes", h.List)
	r.GET("/codes/:id", h.Get)
	r.POST("/codes", h.Create)
	r.PUT("/codes/:id", h.Update)
	r.DELETE("/codes/:id", h.Delete)
	return r
}

// --- List ---

func TestMVCHandler_List_Success(t *testing.T) {
	svc := &mockMVCService{
		getAllFn: func() ([]models.MedalVerseCode, error) {
			return []models.MedalVerseCode{{Code: "ABC"}}, nil
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/codes", nil)
	newMVCTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestMVCHandler_List_ServiceError(t *testing.T) {
	svc := &mockMVCService{
		getAllFn: func() ([]models.MedalVerseCode, error) { return nil, errors.New("fail") },
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/codes", nil)
	newMVCTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status: want 500, got %d", w.Code)
	}
}

// --- Get ---

func TestMVCHandler_Get_Success(t *testing.T) {
	id := uuid.New()
	svc := &mockMVCService{
		getByIDFn: func(uid uuid.UUID) (*models.MedalVerseCode, error) {
			return &models.MedalVerseCode{CodeID: uid, Code: "ABC"}, nil
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/codes/"+id.String(), nil)
	newMVCTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestMVCHandler_Get_InvalidID(t *testing.T) {
	svc := &mockMVCService{}
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/codes/bad", nil)
	newMVCTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: want 400, got %d", w.Code)
	}
}

func TestMVCHandler_Get_NotFound(t *testing.T) {
	svc := &mockMVCService{
		getByIDFn: func(id uuid.UUID) (*models.MedalVerseCode, error) { return nil, errors.New("not found") },
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/codes/"+uuid.New().String(), nil)
	newMVCTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status: want 404, got %d", w.Code)
	}
}

// --- Create ---

func TestMVCHandler_Create_Success(t *testing.T) {
	svc := &mockMVCService{
		createFn: func(req services.CreateMedalVerseCodeRequest) (*models.MedalVerseCode, error) {
			return &models.MedalVerseCode{Code: req.Code}, nil
		},
	}

	body, _ := json.Marshal(map[string]interface{}{
		"code":     "NEWCODE",
		"event_id": uuid.New().String(),
	})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/codes", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	newMVCTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("status: want 201, got %d", w.Code)
	}
}

func TestMVCHandler_Create_BadRequest(t *testing.T) {
	svc := &mockMVCService{}
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/codes", bytes.NewReader([]byte("{}")))
	req.Header.Set("Content-Type", "application/json")
	newMVCTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: want 400, got %d", w.Code)
	}
}

func TestMVCHandler_Create_ServiceError(t *testing.T) {
	svc := &mockMVCService{
		createFn: func(req services.CreateMedalVerseCodeRequest) (*models.MedalVerseCode, error) {
			return nil, errors.New("fail")
		},
	}

	body, _ := json.Marshal(map[string]interface{}{
		"code":     "X",
		"event_id": uuid.New().String(),
	})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/codes", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	newMVCTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status: want 500, got %d", w.Code)
	}
}

// --- Update ---

func TestMVCHandler_Update_Success(t *testing.T) {
	id := uuid.New()
	svc := &mockMVCService{
		updateFn: func(uid uuid.UUID, req services.UpdateMedalVerseCodeRequest) (*models.MedalVerseCode, error) {
			return &models.MedalVerseCode{CodeID: uid, Code: req.Code}, nil
		},
	}

	body, _ := json.Marshal(services.UpdateMedalVerseCodeRequest{Code: "UPDATED"})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/codes/"+id.String(), bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	newMVCTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestMVCHandler_Update_InvalidID(t *testing.T) {
	svc := &mockMVCService{}
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/codes/bad", bytes.NewReader([]byte("{}")))
	req.Header.Set("Content-Type", "application/json")
	newMVCTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: want 400, got %d", w.Code)
	}
}

func TestMVCHandler_Update_ServiceError(t *testing.T) {
	svc := &mockMVCService{
		updateFn: func(id uuid.UUID, req services.UpdateMedalVerseCodeRequest) (*models.MedalVerseCode, error) {
			return nil, errors.New("fail")
		},
	}

	body, _ := json.Marshal(services.UpdateMedalVerseCodeRequest{Code: "X"})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/codes/"+uuid.New().String(), bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	newMVCTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status: want 500, got %d", w.Code)
	}
}

// --- Delete ---

func TestMVCHandler_Delete_Success(t *testing.T) {
	svc := &mockMVCService{
		deleteFn: func(id uuid.UUID) error { return nil },
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/codes/"+uuid.New().String(), nil)
	newMVCTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestMVCHandler_Delete_InvalidID(t *testing.T) {
	svc := &mockMVCService{}
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/codes/bad", nil)
	newMVCTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: want 400, got %d", w.Code)
	}
}

func TestMVCHandler_Delete_ServiceError(t *testing.T) {
	svc := &mockMVCService{
		deleteFn: func(id uuid.UUID) error { return errors.New("fail") },
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/codes/"+uuid.New().String(), nil)
	newMVCTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status: want 500, got %d", w.Code)
	}
}
