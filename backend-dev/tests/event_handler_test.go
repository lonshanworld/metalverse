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

type mockEventService struct {
	getAllFn   func(page, pageSize int, createdBy *uuid.UUID) (*services.PaginatedEvents, error)
	getByIDFn  func(id uuid.UUID) (*models.Event, error)
	getByOrgFn func(orgID uuid.UUID) ([]models.Event, error)
	createFn   func(req services.CreateEventRequest) (*models.Event, error)
	updateFn   func(id uuid.UUID, req services.UpdateEventRequest) (*models.Event, error)
	deleteFn   func(id uuid.UUID) error
}

func (m *mockEventService) GetAll(page, pageSize int, createdBy *uuid.UUID) (*services.PaginatedEvents, error) {
	return m.getAllFn(page, pageSize, createdBy)
}
func (m *mockEventService) GetByID(id uuid.UUID) (*models.Event, error) { return m.getByIDFn(id) }
func (m *mockEventService) GetByOrgID(orgID uuid.UUID) ([]models.Event, error) {
	return m.getByOrgFn(orgID)
}
func (m *mockEventService) Create(req services.CreateEventRequest) (*models.Event, error) {
	return m.createFn(req)
}
func (m *mockEventService) Update(id uuid.UUID, req services.UpdateEventRequest) (*models.Event, error) {
	return m.updateFn(id, req)
}
func (m *mockEventService) Delete(id uuid.UUID) error { return m.deleteFn(id) }

func newEventTestRouter(svc services.EventService) *gin.Engine {
	r := gin.New()
	h := handlers.NewEventHandler(svc)
	r.GET("/events", h.List)
	r.GET("/events/:id", h.Get)
	r.POST("/events", h.Create)
	r.PUT("/events/:id", h.Update)
	r.DELETE("/events/:id", h.Delete)
	return r
}

// --- List ---

func TestEventHandler_List_Success(t *testing.T) {
	svc := &mockEventService{
		getAllFn: func(page, pageSize int, createdBy *uuid.UUID) (*services.PaginatedEvents, error) {
			return &services.PaginatedEvents{
				Data: []models.Event{{Name: "E1"}}, Total: 1, Page: page, PageSize: pageSize, TotalPages: 1,
			}, nil
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/events", nil)
	newEventTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestEventHandler_List_CustomPagination(t *testing.T) {
	var gotPage, gotPS int
	svc := &mockEventService{
		getAllFn: func(page, pageSize int, createdBy *uuid.UUID) (*services.PaginatedEvents, error) {
			gotPage = page
			gotPS = pageSize
			return &services.PaginatedEvents{Data: nil, Page: page, PageSize: pageSize}, nil
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/events?page=2&page_size=20", nil)
	newEventTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status: want 200, got %d", w.Code)
	}
	if gotPage != 2 {
		t.Errorf("page: want 2, got %d", gotPage)
	}
	if gotPS != 20 {
		t.Errorf("page_size: want 20, got %d", gotPS)
	}
}

func TestEventHandler_List_ServiceError(t *testing.T) {
	svc := &mockEventService{
		getAllFn: func(page, pageSize int, createdBy *uuid.UUID) (*services.PaginatedEvents, error) {
			return nil, errors.New("fail")
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/events", nil)
	newEventTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status: want 500, got %d", w.Code)
	}
}

// --- Get ---

func TestEventHandler_Get_Success(t *testing.T) {
	id := uuid.New()
	svc := &mockEventService{
		getByIDFn: func(uid uuid.UUID) (*models.Event, error) {
			return &models.Event{EventID: uid, Name: "Test"}, nil
		},
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/events/"+id.String(), nil)
	newEventTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestEventHandler_Get_InvalidID(t *testing.T) {
	svc := &mockEventService{}
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/events/bad-id", nil)
	newEventTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: want 400, got %d", w.Code)
	}
}

func TestEventHandler_Get_NotFound(t *testing.T) {
	svc := &mockEventService{
		getByIDFn: func(id uuid.UUID) (*models.Event, error) { return nil, errors.New("not found") },
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/events/"+uuid.New().String(), nil)
	newEventTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status: want 404, got %d", w.Code)
	}
}

// --- Create ---

func TestEventHandler_Create_Success(t *testing.T) {
	svc := &mockEventService{
		createFn: func(req services.CreateEventRequest) (*models.Event, error) {
			return &models.Event{Name: req.Name}, nil
		},
	}

	body, _ := json.Marshal(map[string]interface{}{
		"org_id":   uuid.New().String(),
		"name":     "New Event",
		"start_at": "2026-01-01T00:00:00Z",
		"end_at":   "2026-01-02T00:00:00Z",
	})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/events", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	newEventTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("status: want 201, got %d", w.Code)
	}
}

func TestEventHandler_Create_BadRequest(t *testing.T) {
	svc := &mockEventService{}
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/events", bytes.NewReader([]byte("{}")))
	req.Header.Set("Content-Type", "application/json")
	newEventTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: want 400, got %d", w.Code)
	}
}

func TestEventHandler_Create_ServiceError(t *testing.T) {
	svc := &mockEventService{
		createFn: func(req services.CreateEventRequest) (*models.Event, error) {
			return nil, errors.New("fail")
		},
	}

	body, _ := json.Marshal(map[string]interface{}{
		"org_id":   uuid.New().String(),
		"name":     "E",
		"start_at": "2026-01-01T00:00:00Z",
		"end_at":   "2026-01-02T00:00:00Z",
	})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/events", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	newEventTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status: want 500, got %d", w.Code)
	}
}

// --- Update ---

func TestEventHandler_Update_Success(t *testing.T) {
	id := uuid.New()
	svc := &mockEventService{
		updateFn: func(uid uuid.UUID, req services.UpdateEventRequest) (*models.Event, error) {
			return &models.Event{EventID: uid, Name: req.Name}, nil
		},
	}

	body, _ := json.Marshal(services.UpdateEventRequest{Name: "Updated"})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/events/"+id.String(), bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	newEventTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestEventHandler_Update_InvalidID(t *testing.T) {
	svc := &mockEventService{}
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, "/events/bad", bytes.NewReader([]byte("{}")))
	req.Header.Set("Content-Type", "application/json")
	newEventTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: want 400, got %d", w.Code)
	}
}

// --- Delete ---

func TestEventHandler_Delete_Success(t *testing.T) {
	svc := &mockEventService{
		deleteFn: func(id uuid.UUID) error { return nil },
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/events/"+uuid.New().String(), nil)
	newEventTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestEventHandler_Delete_InvalidID(t *testing.T) {
	svc := &mockEventService{}
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/events/bad", nil)
	newEventTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: want 400, got %d", w.Code)
	}
}

func TestEventHandler_Delete_ServiceError(t *testing.T) {
	svc := &mockEventService{
		deleteFn: func(id uuid.UUID) error { return errors.New("fail") },
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/events/"+uuid.New().String(), nil)
	newEventTestRouter(svc).ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status: want 500, got %d", w.Code)
	}
}
