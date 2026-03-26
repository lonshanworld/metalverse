package handlers

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"net/url"
	"strings"
	"time"

	"medalverse-be/internal/config"
	"medalverse-be/internal/models"
	"medalverse-be/internal/services"
	"medalverse-be/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db           *gorm.DB
	cfg          *config.Config
	emailService services.EmailService // Added emailService field
}

func NewAuthHandler(db *gorm.DB, cfg *config.Config, emailService services.EmailService) *AuthHandler {
	return &AuthHandler{
		db:           db,
		cfg:          cfg,
		emailService: emailService, // Initialized emailService
	}
}

type RegisterRequest struct {
	Email     string  `json:"email" binding:"required,email"`
	Password  string  `json:"password" binding:"required,min=6"`
	Username  *string `json:"username"`
	FirstName *string `json:"first_name"`
	LastName  *string `json:"last_name"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string       `json:"token"`
	User  *models.User `json:"user"`
}

func normalizeEmail(raw string) string {
	return strings.ToLower(strings.TrimSpace(raw))
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.Email = normalizeEmail(req.Email)

	var existingUser models.User
	query := h.db.Where("email = ?", req.Email)
	if req.Username != nil && *req.Username != "" {
		query = h.db.Where("email = ? OR username = ?", req.Email, *req.Username)
	}

	if err := query.First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email or username already exists"})
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Generate a 6-digit OTP
	n, _ := rand.Int(rand.Reader, big.NewInt(1000000))
	tokenString := fmt.Sprintf("%06d", n.Int64())
	expiresAt := time.Now().Add(24 * time.Hour)

	user := models.User{
		Email:                      req.Email,
		Password:                   &hashedPassword,
		IsActive:                   true,
		IsEmailVerified:            true, // Bypassing for now
		EmailVerificationToken:     &tokenString,
		EmailVerificationExpiresAt: &expiresAt,
	}

	if req.Username != nil {
		user.Username = req.Username
	}
	if req.FirstName != nil {
		user.FirstName = req.FirstName
	}
	if req.LastName != nil {
		user.LastName = req.LastName
	}

	if err := h.db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Dispatch the verification email via SES
	if err := h.emailService.SendVerificationCode(c.Request.Context(), user.Email, tokenString); err != nil {
		log.Printf("Failed to send verification email: %v", err)
		// We still return a 201 so the user account exists, but they will likely need a resend.
		// For now we just log it and proceed.
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":           "Registration successful. Please check your email for the 6-digit verification code.",
		"user":              &user,
		"verification_code": tokenString, // TODO: Remove this in production. Leave for dev ease-of-use.
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.Email = normalizeEmail(req.Email)

	var user models.User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if user.Password == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "This account was registered using Google. Please login with Google."})
		return
	}

	if !utils.CheckPasswordHash(req.Password, *user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if !user.IsActive {
		c.JSON(http.StatusForbidden, gin.H{"error": "Account is inactive"})
		return
	}

	// Bypassed for now
	// if !user.IsEmailVerified {
	// 	c.JSON(http.StatusForbidden, gin.H{"error": "Please verify your email address before logging in. Check your inbox for the verification link."})
	// 	return
	// }

	token, err := utils.GenerateToken(user.UserID.String(), user.Email, h.cfg.JWT.Secret, h.cfg.JWT.ExpiryHours)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  &user,
	})
}

func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

type VerifyEmailRequest struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required"`
}

func (h *AuthHandler) VerifyEmail(c *gin.Context) {
	var req VerifyEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.EmailVerificationToken == nil || *user.EmailVerificationToken != req.Code {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid verification code"})
		return
	}

	if user.EmailVerificationExpiresAt != nil && time.Now().After(*user.EmailVerificationExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Verification code has expired. Please request a new one."})
		return
	}

	user.IsEmailVerified = true
	user.EmailVerificationToken = nil
	user.EmailVerificationExpiresAt = nil

	if err := h.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Email verified successfully! You can now log in."})
}

// Google OAuth configuration helper
func (h *AuthHandler) getGoogleOAuthConfig() *oauth2.Config {
	return &oauth2.Config{
		ClientID:     h.cfg.Google.ClientID,
		ClientSecret: h.cfg.Google.ClientSecret,
		RedirectURL:  h.cfg.Google.RedirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}
}

// GoogleLogin redirects the user to the Google consent screen
func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	config := h.getGoogleOAuthConfig()
	// Using a static state for simplicity. For production, consider using a dynamic state generated per request and stored in a cookie.
	state := "oauth2state"
	url := config.AuthCodeURL(state, oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// GoogleCallback handles the redirection from Google after user grants consent
func (h *AuthHandler) GoogleCallback(c *gin.Context) {
	state := c.Query("state")
	if state != "oauth2state" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid OAuth state"})
		return
	}

	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing authorization code"})
		return
	}

	config := h.getGoogleOAuthConfig()
	token, err := config.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange authorization code for token"})
		return
	}

	client := config.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info from Google"})
		return
	}
	defer resp.Body.Close()

	var googleUser struct {
		ID        string `json:"id"`
		Email     string `json:"email"`
		FirstName string `json:"given_name"`
		LastName  string `json:"family_name"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user info"})
		return
	}

	// Check if user already exists
	var user models.User
	err = h.db.Where("email = ?", googleUser.Email).First(&user).Error

	if err == gorm.ErrRecordNotFound {
		// Create new user for Google Login
		user = models.User{
			UserID:          uuid.New(),
			Email:           googleUser.Email,
			Password:        nil,
			FirstName:       &googleUser.FirstName,
			LastName:        &googleUser.LastName,
			IsActive:        true,
			IsEmailVerified: true,
		}

		if createErr := h.db.Create(&user).Error; createErr != nil {
			log.Printf("Failed to create new user from Google: %v", createErr)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save new user from Google: %v", createErr)})
			return
		}
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error while fetching user"})
		return
	}

	// Generate JWT for the application
	jwtToken, err := utils.GenerateToken(user.UserID.String(), user.Email, h.cfg.JWT.Secret, h.cfg.JWT.ExpiryHours)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate application token"})
		return
	}

	// Redirect back to frontend with the token (must be URL-encoded: JWTs may contain '+' etc.)
	eventPortalRedirectURL := fmt.Sprintf("%s/auth/callback?token=%s", h.cfg.Server.EventPortalURL, url.QueryEscape(jwtToken))
	c.Redirect(http.StatusFound, eventPortalRedirectURL)
}
