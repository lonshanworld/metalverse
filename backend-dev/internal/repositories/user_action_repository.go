package repositories

import (
	"medalverse-be/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ─── EventBookmark ───

type EventBookmarkRepository interface {
	GetByUserID(userID uuid.UUID) ([]models.EventBookmark, error)
	Toggle(userID, eventID uuid.UUID) (bool, error) // returns true if bookmarked
	IsBookmarked(userID, eventID uuid.UUID) (bool, error)
}

type eventBookmarkRepository struct{ db *gorm.DB }

func NewEventBookmarkRepository(db *gorm.DB) EventBookmarkRepository {
	return &eventBookmarkRepository{db: db}
}

func (r *eventBookmarkRepository) GetByUserID(userID uuid.UUID) ([]models.EventBookmark, error) {
	var bookmarks []models.EventBookmark
	if err := r.db.
		Preload("Event").
		Preload("Event.Organization").
		Preload("Event.CoverFile").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&bookmarks).Error; err != nil {
		return nil, err
	}
	return bookmarks, nil
}

func (r *eventBookmarkRepository) Toggle(userID, eventID uuid.UUID) (bool, error) {
	var existing models.EventBookmark
	err := r.db.Where("user_id = ? AND event_id = ?", userID, eventID).First(&existing).Error
	if err == nil {
		// Already bookmarked → remove
		if err := r.db.Delete(&existing).Error; err != nil {
			return false, err
		}
		return false, nil
	}
	if err != gorm.ErrRecordNotFound {
		return false, err
	}
	// Not bookmarked → add
	bm := models.EventBookmark{UserID: userID, EventID: eventID}
	if err := r.db.Create(&bm).Error; err != nil {
		return false, err
	}
	return true, nil
}

func (r *eventBookmarkRepository) IsBookmarked(userID, eventID uuid.UUID) (bool, error) {
	var count int64
	if err := r.db.Model(&models.EventBookmark{}).Where("user_id = ? AND event_id = ?", userID, eventID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// ─── EventTicketType ───

type EventTicketTypeRepository interface {
	GetByEventID(eventID uuid.UUID) ([]models.EventTicketType, error)
	GetByID(id uuid.UUID) (*models.EventTicketType, error)
	Create(tt *models.EventTicketType) error
	Update(tt *models.EventTicketType) error
	Delete(id uuid.UUID) error
}

type eventTicketTypeRepository struct{ db *gorm.DB }

func NewEventTicketTypeRepository(db *gorm.DB) EventTicketTypeRepository {
	return &eventTicketTypeRepository{db: db}
}

func (r *eventTicketTypeRepository) GetByEventID(eventID uuid.UUID) ([]models.EventTicketType, error) {
	var types []models.EventTicketType
	if err := r.db.Where("event_id = ?", eventID).Find(&types).Error; err != nil {
		return nil, err
	}
	return types, nil
}

func (r *eventTicketTypeRepository) GetByID(id uuid.UUID) (*models.EventTicketType, error) {
	var tt models.EventTicketType
	if err := r.db.First(&tt, "ticket_type_id = ?", id).Error; err != nil {
		return nil, err
	}
	return &tt, nil
}

func (r *eventTicketTypeRepository) Create(tt *models.EventTicketType) error {
	return r.db.Create(tt).Error
}
func (r *eventTicketTypeRepository) Update(tt *models.EventTicketType) error {
	return r.db.Save(tt).Error
}
func (r *eventTicketTypeRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.EventTicketType{}, "ticket_type_id = ?", id).Error
}

// ─── EventRegistration ───

type EventRegistrationRepository interface {
	GetByEventID(eventID uuid.UUID) ([]models.EventRegistration, error)
	GetByUserID(userID uuid.UUID) ([]models.EventRegistration, error)
	GetByID(id uuid.UUID) (*models.EventRegistration, error)
	Create(reg *models.EventRegistration) error
	Update(reg *models.EventRegistration) error
}

type eventRegistrationRepository struct{ db *gorm.DB }

func NewEventRegistrationRepository(db *gorm.DB) EventRegistrationRepository {
	return &eventRegistrationRepository{db: db}
}

func (r *eventRegistrationRepository) GetByEventID(eventID uuid.UUID) ([]models.EventRegistration, error) {
	var regs []models.EventRegistration
	if err := r.db.
		Preload("User").
		Preload("TicketType").
		Where("event_id = ?", eventID).
		Order("registered_at DESC").
		Find(&regs).Error; err != nil {
		return nil, err
	}
	return regs, nil
}

func (r *eventRegistrationRepository) GetByUserID(userID uuid.UUID) ([]models.EventRegistration, error) {
	var regs []models.EventRegistration
	if err := r.db.
		Preload("Event").
		Preload("Event.Organization").
		Preload("TicketType").
		Where("user_id = ?", userID).
		Order("registered_at DESC").
		Find(&regs).Error; err != nil {
		return nil, err
	}
	return regs, nil
}

func (r *eventRegistrationRepository) GetByID(id uuid.UUID) (*models.EventRegistration, error) {
	var reg models.EventRegistration
	if err := r.db.
		Preload("Event").
		Preload("User").
		Preload("TicketType").
		First(&reg, "registration_id = ?", id).Error; err != nil {
		return nil, err
	}
	return &reg, nil
}

func (r *eventRegistrationRepository) Create(reg *models.EventRegistration) error {
	return r.db.Create(reg).Error
}

func (r *eventRegistrationRepository) Update(reg *models.EventRegistration) error {
	return r.db.Save(reg).Error
}

// ─── EventView ───

type EventViewRepository interface {
	Create(view *models.EventView) error
	GetByUserID(userID uuid.UUID, limit int) ([]models.EventView, error)
}

type eventViewRepository struct{ db *gorm.DB }

func NewEventViewRepository(db *gorm.DB) EventViewRepository {
	return &eventViewRepository{db: db}
}

func (r *eventViewRepository) Create(view *models.EventView) error {
	return r.db.Create(view).Error
}

func (r *eventViewRepository) GetByUserID(userID uuid.UUID, limit int) ([]models.EventView, error) {
	var views []models.EventView
	if err := r.db.
		Preload("Event").
		Preload("Event.CoverFile").
		Where("user_id = ?", userID).
		Order("viewed_at DESC").
		Limit(limit).
		Find(&views).Error; err != nil {
		return nil, err
	}
	return views, nil
}

// ─── OrganizationMember ───

type OrganizationMemberRepository interface {
	GetByOrgID(orgID uuid.UUID) ([]models.OrganizationMember, error)
	GetByUserID(userID uuid.UUID) ([]models.OrganizationMember, error)
	Create(member *models.OrganizationMember) error
	Update(member *models.OrganizationMember) error
	Delete(id uuid.UUID) error
}

type organizationMemberRepository struct{ db *gorm.DB }

func NewOrganizationMemberRepository(db *gorm.DB) OrganizationMemberRepository {
	return &organizationMemberRepository{db: db}
}

func (r *organizationMemberRepository) GetByOrgID(orgID uuid.UUID) ([]models.OrganizationMember, error) {
	var members []models.OrganizationMember
	if err := r.db.Preload("User").Where("org_id = ?", orgID).Find(&members).Error; err != nil {
		return nil, err
	}
	return members, nil
}

func (r *organizationMemberRepository) GetByUserID(userID uuid.UUID) ([]models.OrganizationMember, error) {
	var members []models.OrganizationMember
	if err := r.db.Preload("Organization").Where("user_id = ?", userID).Find(&members).Error; err != nil {
		return nil, err
	}
	return members, nil
}

func (r *organizationMemberRepository) Create(member *models.OrganizationMember) error {
	return r.db.Create(member).Error
}
func (r *organizationMemberRepository) Update(member *models.OrganizationMember) error {
	return r.db.Save(member).Error
}
func (r *organizationMemberRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.OrganizationMember{}, "org_member_id = ?", id).Error
}
