package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"medalverse-be/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"medalverse-be/internal/utils"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func testCfg() *config.Config {
	return &config.Config{
		JWT: config.JWTConfig{
			Secret:      "test-secret-key",
			ExpiryHours: 24,
		},
	}
}

// --- AuthMiddleware ---

func TestAuthMiddleware_ValidToken(t *testing.T) {
	cfg := testCfg()
	userID := uuid.New().String()
	token, _ := utils.GenerateToken(userID, "test@test.com", cfg.JWT.Secret, cfg.JWT.ExpiryHours)

	r := gin.New()
	r.Use(AuthMiddleware(cfg))
	r.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status: want 200, got %d", w.Code)
	}
}

func TestAuthMiddleware_MissingHeader(t *testing.T) {
	cfg := testCfg()
	r := gin.New()
	r.Use(AuthMiddleware(cfg))
	r.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/test", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("status: want 401, got %d", w.Code)
	}
}

func TestAuthMiddleware_InvalidFormat(t *testing.T) {
	cfg := testCfg()
	r := gin.New()
	r.Use(AuthMiddleware(cfg))
	r.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	cases := []struct {
		name   string
		header string
	}{
		{"no Bearer prefix", "token-only"},
		{"wrong prefix", "Basic some-token"},
		{"three parts", "Bearer token extra"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest(http.MethodGet, "/test", nil)
			req.Header.Set("Authorization", tc.header)
			r.ServeHTTP(w, req)

			if w.Code != http.StatusUnauthorized {
				t.Errorf("status: want 401, got %d", w.Code)
			}
		})
	}
}

func TestAuthMiddleware_InvalidToken(t *testing.T) {
	cfg := testCfg()
	r := gin.New()
	r.Use(AuthMiddleware(cfg))
	r.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer invalid.token.here")
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("status: want 401, got %d", w.Code)
	}
}

func TestAuthMiddleware_WrongSecret(t *testing.T) {
	cfg := testCfg()
	token, _ := utils.GenerateToken("user-1", "a@x.com", "different-secret", 24)

	r := gin.New()
	r.Use(AuthMiddleware(cfg))
	r.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("status: want 401, got %d", w.Code)
	}
}

func TestAuthMiddleware_SetsContextValues(t *testing.T) {
	cfg := testCfg()
	userID := uuid.New().String()
	email := "context@test.com"
	token, _ := utils.GenerateToken(userID, email, cfg.JWT.Secret, cfg.JWT.ExpiryHours)

	var gotUserID, gotEmail interface{}
	r := gin.New()
	r.Use(AuthMiddleware(cfg))
	r.GET("/test", func(c *gin.Context) {
		gotUserID, _ = c.Get("user_id")
		gotEmail, _ = c.Get("user_email")
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	r.ServeHTTP(w, req)

	if gotUserID != userID {
		t.Errorf("user_id: want %s, got %v", userID, gotUserID)
	}
	if gotEmail != email {
		t.Errorf("user_email: want %s, got %v", email, gotEmail)
	}
}

// --- GetUserID ---

func TestGetUserID_Exists(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	id := uuid.New()
	c.Set("user_id", id)

	got, ok := GetUserID(c)
	if !ok {
		t.Error("expected ok=true")
	}
	if got != id {
		t.Errorf("want %v, got %v", id, got)
	}
}

func TestGetUserID_NotExists(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	_, ok := GetUserID(c)
	if ok {
		t.Error("expected ok=false when user_id not set")
	}
}

func TestGetUserID_WrongType(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Set("user_id", "not-a-uuid-type")

	_, ok := GetUserID(c)
	if ok {
		t.Error("expected ok=false when user_id is wrong type")
	}
}

// --- GetUserEmail ---

func TestGetUserEmail_Exists(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Set("user_email", "test@test.com")

	email, ok := GetUserEmail(c)
	if !ok {
		t.Error("expected ok=true")
	}
	if email != "test@test.com" {
		t.Errorf("want test@test.com, got %s", email)
	}
}

func TestGetUserEmail_NotExists(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	_, ok := GetUserEmail(c)
	if ok {
		t.Error("expected ok=false when user_email not set")
	}
}

func TestGetUserEmail_WrongType(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Set("user_email", 12345)

	_, ok := GetUserEmail(c)
	if ok {
		t.Error("expected ok=false when user_email is wrong type")
	}
}
