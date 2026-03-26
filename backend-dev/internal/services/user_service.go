package services

import (
	"medalverse-be/internal/models"
	"medalverse-be/internal/repositories"
	"medalverse-be/internal/utils"

	"github.com/google/uuid"
)

type UserService interface {
	GetAll() ([]models.User, error)
	GetByID(id uuid.UUID) (*models.User, error)
	GetByEmail(email string) (*models.User, error)
	Update(id uuid.UUID, req UpdateUserRequest) (*models.User, error)
	Delete(id uuid.UUID) error
}

type UpdateUserRequest struct {
	Username     *string    `json:"username"`
	FirstName    *string    `json:"first_name"`
	LastName     *string    `json:"last_name"`
	Password     string     `json:"password"`
	AvatarFileID *uuid.UUID `json:"avatar_file_id"`
	IsActive     *bool      `json:"is_active"`
}

type userService struct {
	repo repositories.UserRepository
}

func NewUserService(repo repositories.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) GetAll() ([]models.User, error) {
	return s.repo.GetAll()
}

func (s *userService) GetByID(id uuid.UUID) (*models.User, error) {
	return s.repo.GetByID(id)
}

func (s *userService) GetByEmail(email string) (*models.User, error) {
	return s.repo.GetByEmail(email)
}

func (s *userService) Update(id uuid.UUID, req UpdateUserRequest) (*models.User, error) {
	user, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
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
	if req.Password != "" {
		hashed, err := utils.HashPassword(req.Password)
		if err != nil {
			return nil, err
		}
		user.Password = &hashed
	}
	if req.AvatarFileID != nil {
		user.AvatarFileID = req.AvatarFileID
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}

	if err := s.repo.Update(user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *userService) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}
