package database

import (
	"log"
	"time"

	"medalverse-be/internal/models"
	"medalverse-be/internal/utils"

	"github.com/google/uuid"
)

// ── Fixed UUIDs for referential integrity ──────────────────────────────────

// Users
var (
	UserAdmin    = uuid.MustParse("a0000000-0000-0000-0000-000000000001")
	UserSomchai  = uuid.MustParse("a0000000-0000-0000-0000-000000000002")
	UserSiriporn = uuid.MustParse("a0000000-0000-0000-0000-000000000003")
	UserNattawut = uuid.MustParse("a0000000-0000-0000-0000-000000000004")
	UserPloy     = uuid.MustParse("a0000000-0000-0000-0000-000000000005")
)

// Organizations
var (
	OrgCU      = uuid.MustParse("b0000000-0000-0000-0000-000000000001")
	OrgTU      = uuid.MustParse("b0000000-0000-0000-0000-000000000002")
	OrgStartup = uuid.MustParse("b0000000-0000-0000-0000-000000000003")
)

// Locations
var (
	LocCUSamyan   = uuid.MustParse("c0000000-0000-0000-0000-000000000001")
	LocTURangsit  = uuid.MustParse("c0000000-0000-0000-0000-000000000002")
	LocTrueDigPrk = uuid.MustParse("c0000000-0000-0000-0000-000000000003")
)

// Files
var (
	FileCULogo     = uuid.MustParse("d0000000-0000-0000-0000-000000000001")
	FileTULogo     = uuid.MustParse("d0000000-0000-0000-0000-000000000002")
	FileStartupLog = uuid.MustParse("d0000000-0000-0000-0000-000000000003")
	FileEventCov1  = uuid.MustParse("d0000000-0000-0000-0000-000000000004")
	FileEventCov2  = uuid.MustParse("d0000000-0000-0000-0000-000000000005")
	FileMedia1     = uuid.MustParse("d0000000-0000-0000-0000-000000000006")
	FileMedia2     = uuid.MustParse("d0000000-0000-0000-0000-000000000007")
	FileSpeakerAvt = uuid.MustParse("d0000000-0000-0000-0000-000000000008")
)

// Master data
var (
	ETWorkshop    = uuid.MustParse("e1000000-0000-0000-0000-000000000001")
	ETCompetition = uuid.MustParse("e1000000-0000-0000-0000-000000000002")
	ETConference  = uuid.MustParse("e1000000-0000-0000-0000-000000000003")
	ETHackathon   = uuid.MustParse("e1000000-0000-0000-0000-000000000004")
	ETSeminar     = uuid.MustParse("e1000000-0000-0000-0000-000000000005")

	FieldTech   = uuid.MustParse("e2000000-0000-0000-0000-000000000001")
	FieldBiz    = uuid.MustParse("e2000000-0000-0000-0000-000000000002")
	FieldDesign = uuid.MustParse("e2000000-0000-0000-0000-000000000003")
	FieldData   = uuid.MustParse("e2000000-0000-0000-0000-000000000004")
	FieldAI     = uuid.MustParse("e2000000-0000-0000-0000-000000000005")

	PMOnsite = uuid.MustParse("e3000000-0000-0000-0000-000000000001")
	PMOnline = uuid.MustParse("e3000000-0000-0000-0000-000000000002")
	PMHybrid = uuid.MustParse("e3000000-0000-0000-0000-000000000003")

	CLBeginner     = uuid.MustParse("e4000000-0000-0000-0000-000000000001")
	CLIntermediate = uuid.MustParse("e4000000-0000-0000-0000-000000000002")
	CLAdvanced     = uuid.MustParse("e4000000-0000-0000-0000-000000000003")
	CLOpen         = uuid.MustParse("e4000000-0000-0000-0000-000000000004")

	EligStudent   = uuid.MustParse("e5000000-0000-0000-0000-000000000001")
	EligPro       = uuid.MustParse("e5000000-0000-0000-0000-000000000002")
	EligUndergrad = uuid.MustParse("e5000000-0000-0000-0000-000000000003")
	EligAnyone    = uuid.MustParse("e5000000-0000-0000-0000-000000000004")
)

// Events
var (
	Event1 = uuid.MustParse("f0000000-0000-0000-0000-000000000001")
	Event2 = uuid.MustParse("f0000000-0000-0000-0000-000000000002")
	Event3 = uuid.MustParse("f0000000-0000-0000-0000-000000000003")
)

// Tags
var (
	TagAI         = uuid.MustParse("f1000000-0000-0000-0000-000000000001")
	TagWebDev     = uuid.MustParse("f1000000-0000-0000-0000-000000000002")
	TagStartup    = uuid.MustParse("f1000000-0000-0000-0000-000000000003")
	TagBlockchain = uuid.MustParse("f1000000-0000-0000-0000-000000000004")
	TagDesign     = uuid.MustParse("f1000000-0000-0000-0000-000000000005")
)

// Outcomes
var (
	OutCert    = uuid.MustParse("f2000000-0000-0000-0000-000000000001")
	OutNetwork = uuid.MustParse("f2000000-0000-0000-0000-000000000002")
	OutPrize   = uuid.MustParse("f2000000-0000-0000-0000-000000000003")
)

// Speakers
var (
	Speaker1 = uuid.MustParse("f3000000-0000-0000-0000-000000000001")
	Speaker2 = uuid.MustParse("f3000000-0000-0000-0000-000000000002")
)

// Ticket types
var (
	TicketFree1 = uuid.MustParse("f4000000-0000-0000-0000-000000000001")
	TicketVIP1  = uuid.MustParse("f4000000-0000-0000-0000-000000000002")
	TicketFree2 = uuid.MustParse("f4000000-0000-0000-0000-000000000003")
)

// Registrations
var (
	Reg1 = uuid.MustParse("f5000000-0000-0000-0000-000000000001")
	Reg2 = uuid.MustParse("f5000000-0000-0000-0000-000000000002")
	Reg3 = uuid.MustParse("f5000000-0000-0000-0000-000000000003")
	Reg4 = uuid.MustParse("f5000000-0000-0000-0000-000000000004")
)

// Credentials
var (
	Cred1 = uuid.MustParse("f6000000-0000-0000-0000-000000000001")
	Cred2 = uuid.MustParse("f6000000-0000-0000-0000-000000000002")
	Cred3 = uuid.MustParse("f6000000-0000-0000-0000-000000000003")
)

// MedalVerseCodes
var (
	Code1 = uuid.MustParse("f7000000-0000-0000-0000-000000000001")
	Code2 = uuid.MustParse("f7000000-0000-0000-0000-000000000002")
)

// ── Seed function ──────────────────────────────────────────────────────────

func (d *Database) Seed() error {
	log.Println("🌱 Seeding database...")

	pw, _ := utils.HashPassword("P@ssword123")
	strPtr := func(s string) *string { return &s }

	now := time.Now()
	past := now.AddDate(0, -1, 0)
	future := now.AddDate(0, 1, 0)
	regDeadline := now.AddDate(0, 0, 20)

	// ═══════════════════════════════════════════════════════════════════════
	// 1. USERS
	// ═══════════════════════════════════════════════════════════════════════
	users := []models.User{
		{UserID: UserAdmin, Email: "admin@medalverse.io", Username: strPtr("admin"), Password: strPtr(pw), FirstName: strPtr("Admin"), LastName: strPtr("System"), IsActive: true},
		{UserID: UserSomchai, Email: "somchai@gmail.com", Username: strPtr("somchai_dev"), Password: strPtr(pw), FirstName: strPtr("สมชาย"), LastName: strPtr("รักเรียน"), IsActive: true},
		{UserID: UserSiriporn, Email: "siriporn@outlook.com", Username: strPtr("siriporn_pm"), Password: strPtr(pw), FirstName: strPtr("ศิริพร"), LastName: strPtr("จันทร์สว่าง"), IsActive: true},
		{UserID: UserNattawut, Email: "nattawut@company.co.th", Username: strPtr("nattawut_ai"), Password: strPtr(pw), FirstName: strPtr("ณัฐวุฒิ"), LastName: strPtr("เทคโนโลยี"), IsActive: true},
		{UserID: UserPloy, Email: "ploy.design@gmail.com", Username: strPtr("ploy_ux"), Password: strPtr(pw), FirstName: strPtr("พลอย"), LastName: strPtr("สร้างสรรค์"), IsActive: true},
	}
	for i := range users {
		d.DB.Where("user_id = ?", users[i].UserID).FirstOrCreate(&users[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 2. FILES (logos, covers, media)
	// ═══════════════════════════════════════════════════════════════════════
	files := []models.File{
		{FileID: FileCULogo, OwnerUserID: &UserAdmin, FileName: "cu-logo.png", FileSize: 45000, MimeType: "image/png", StorageKey: "uploads/logos/cu-logo.png", URL: "http://localhost:9000/medalverse/uploads/logos/cu-logo.png"},
		{FileID: FileTULogo, OwnerUserID: &UserAdmin, FileName: "tu-logo.png", FileSize: 38000, MimeType: "image/png", StorageKey: "uploads/logos/tu-logo.png", URL: "http://localhost:9000/medalverse/uploads/logos/tu-logo.png"},
		{FileID: FileStartupLog, OwnerUserID: &UserAdmin, FileName: "startup-hub-logo.png", FileSize: 52000, MimeType: "image/png", StorageKey: "uploads/logos/startup-hub-logo.png", URL: "http://localhost:9000/medalverse/uploads/logos/startup-hub-logo.png"},
		{FileID: FileEventCov1, OwnerUserID: &UserSomchai, FileName: "hackathon-cover.jpg", FileSize: 320000, MimeType: "image/jpeg", StorageKey: "uploads/events/hackathon-cover.jpg", URL: "http://localhost:9000/medalverse/uploads/events/hackathon-cover.jpg"},
		{FileID: FileEventCov2, OwnerUserID: &UserNattawut, FileName: "startup-weekend-cover.jpg", FileSize: 280000, MimeType: "image/jpeg", StorageKey: "uploads/events/startup-weekend-cover.jpg", URL: "http://localhost:9000/medalverse/uploads/events/startup-weekend-cover.jpg"},
		{FileID: FileMedia1, OwnerUserID: &UserSomchai, FileName: "event-photo-1.jpg", FileSize: 150000, MimeType: "image/jpeg", StorageKey: "uploads/media/event-photo-1.jpg", URL: "http://localhost:9000/medalverse/uploads/media/event-photo-1.jpg"},
		{FileID: FileMedia2, OwnerUserID: &UserSomchai, FileName: "event-photo-2.jpg", FileSize: 180000, MimeType: "image/jpeg", StorageKey: "uploads/media/event-photo-2.jpg", URL: "http://localhost:9000/medalverse/uploads/media/event-photo-2.jpg"},
		{FileID: FileSpeakerAvt, OwnerUserID: &UserAdmin, FileName: "speaker-avatar.jpg", FileSize: 25000, MimeType: "image/jpeg", StorageKey: "uploads/speakers/speaker-avatar.jpg", URL: "http://localhost:9000/medalverse/uploads/speakers/speaker-avatar.jpg"},
	}
	for i := range files {
		d.DB.Where("file_id = ?", files[i].FileID).FirstOrCreate(&files[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 3. ORGANIZATIONS
	// ═══════════════════════════════════════════════════════════════════════
	orgs := []models.Organization{
		{OrgID: OrgCU, Abbreviation: "CU", Name: "จุฬาลงกรณ์มหาวิทยาลัย", Description: "สถาบันอุดมศึกษาชั้นนำของประเทศไทย ก่อตั้งเมื่อ พ.ศ. 2460", LogoFileID: &FileCULogo, Website: "https://www.chula.ac.th", IsActive: true},
		{OrgID: OrgTU, Abbreviation: "TU", Name: "มหาวิทยาลัยธรรมศาสตร์", Description: "มหาวิทยาลัยแห่งการเรียนรู้และนวัตกรรม", LogoFileID: &FileTULogo, Website: "https://www.tu.ac.th", IsActive: true},
		{OrgID: OrgStartup, Abbreviation: "TSH", Name: "Thailand Startup Hub", Description: "ศูนย์กลางสตาร์ทอัพของประเทศไทย สนับสนุนนวัตกรและผู้ประกอบการรุ่นใหม่", LogoFileID: &FileStartupLog, Website: "https://www.startupthailand.org", IsActive: true},
	}
	for i := range orgs {
		d.DB.Where("org_id = ?", orgs[i].OrgID).FirstOrCreate(&orgs[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 4. ORGANIZATION MEMBERS
	// ═══════════════════════════════════════════════════════════════════════
	orgMembers := []models.OrganizationMember{
		{OrgMemberID: uuid.MustParse("b1000000-0000-0000-0000-000000000001"), OrgID: OrgCU, UserID: UserAdmin, Role: "OWNER"},
		{OrgMemberID: uuid.MustParse("b1000000-0000-0000-0000-000000000002"), OrgID: OrgCU, UserID: UserSomchai, Role: "ADMIN"},
		{OrgMemberID: uuid.MustParse("b1000000-0000-0000-0000-000000000003"), OrgID: OrgTU, UserID: UserSiriporn, Role: "OWNER"},
		{OrgMemberID: uuid.MustParse("b1000000-0000-0000-0000-000000000004"), OrgID: OrgStartup, UserID: UserNattawut, Role: "OWNER"},
		{OrgMemberID: uuid.MustParse("b1000000-0000-0000-0000-000000000005"), OrgID: OrgStartup, UserID: UserPloy, Role: "STAFF"},
	}
	for i := range orgMembers {
		d.DB.Where("org_member_id = ?", orgMembers[i].OrgMemberID).FirstOrCreate(&orgMembers[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 5. LOCATIONS
	// ═══════════════════════════════════════════════════════════════════════
	locations := []models.Location{
		{LocationID: LocCUSamyan, Name: "CU Innovation Hub", Address1: "254 ถนนพญาไท", District: "ปทุมวัน", Province: "กรุงเทพมหานคร", PostalCode: "10330", Country: "Thailand", Latitude: 13.7340, Longitude: 100.5326},
		{LocationID: LocTURangsit, Name: "TU Dome Hall", Address1: "99 หมู่ 18 ถนนพหลโยธิน", District: "คลองหลวง", Province: "ปทุมธานี", PostalCode: "12121", Country: "Thailand", Latitude: 14.0724, Longitude: 100.6075},
		{LocationID: LocTrueDigPrk, Name: "True Digital Park", Address1: "101 ถนนสุขุมวิท", Address2: "อาคาร Bhiraj Tower", District: "บางจาก", Province: "กรุงเทพมหานคร", PostalCode: "10260", Country: "Thailand", Latitude: 13.6870, Longitude: 100.6108},
	}
	for i := range locations {
		d.DB.Where("location_id = ?", locations[i].LocationID).FirstOrCreate(&locations[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 6. MASTER DATA
	// ═══════════════════════════════════════════════════════════════════════
	eventTypes := []models.EventType{
		{EventTypeID: ETWorkshop, Code: "WORKSHOP", Name: "Workshop", IsActive: true},
		{EventTypeID: ETCompetition, Code: "COMPETITION", Name: "Competition", IsActive: true},
		{EventTypeID: ETConference, Code: "CONFERENCE", Name: "Conference", IsActive: true},
		{EventTypeID: ETHackathon, Code: "HACKATHON", Name: "Hackathon", IsActive: true},
		{EventTypeID: ETSeminar, Code: "SEMINAR", Name: "Seminar", IsActive: true},
	}
	for i := range eventTypes {
		d.DB.Where("event_type_id = ?", eventTypes[i].EventTypeID).FirstOrCreate(&eventTypes[i])
	}

	fields := []models.Field{
		{FieldID: FieldTech, Code: "TECH", Name: "Technology", IsActive: true},
		{FieldID: FieldBiz, Code: "BUSINESS", Name: "Business", IsActive: true},
		{FieldID: FieldDesign, Code: "DESIGN", Name: "Design", IsActive: true},
		{FieldID: FieldData, Code: "DATA", Name: "Data Science", IsActive: true},
		{FieldID: FieldAI, Code: "AI", Name: "Artificial Intelligence", IsActive: true},
	}
	for i := range fields {
		d.DB.Where("field_id = ?", fields[i].FieldID).FirstOrCreate(&fields[i])
	}

	pModes := []models.ParticipationMode{
		{ParticipationModeID: PMOnsite, Code: "ONSITE", Name: "On-site", IsActive: true},
		{ParticipationModeID: PMOnline, Code: "ONLINE", Name: "Online", IsActive: true},
		{ParticipationModeID: PMHybrid, Code: "HYBRID", Name: "Hybrid", IsActive: true},
	}
	for i := range pModes {
		d.DB.Where("participation_mode_id = ?", pModes[i].ParticipationModeID).FirstOrCreate(&pModes[i])
	}

	cLevels := []models.CompetitionLevel{
		{CompetitionLevelID: CLBeginner, Code: "BEGINNER", Name: "Beginner", IsActive: true},
		{CompetitionLevelID: CLIntermediate, Code: "INTERMEDIATE", Name: "Intermediate", IsActive: true},
		{CompetitionLevelID: CLAdvanced, Code: "ADVANCED", Name: "Advanced", IsActive: true},
		{CompetitionLevelID: CLOpen, Code: "OPEN", Name: "Open (ทุกระดับ)", IsActive: true},
	}
	for i := range cLevels {
		d.DB.Where("competition_level_id = ?", cLevels[i].CompetitionLevelID).FirstOrCreate(&cLevels[i])
	}

	eligibilities := []models.EligibilityGroup{
		{EligibilityID: EligStudent, Code: "STUDENT", Name: "นักศึกษา", IsActive: true},
		{EligibilityID: EligPro, Code: "PROFESSIONAL", Name: "บุคคลทั่วไป / มืออาชีพ", IsActive: true},
		{EligibilityID: EligUndergrad, Code: "UNDERGRAD", Name: "นักศึกษาปริญญาตรี", IsActive: true},
		{EligibilityID: EligAnyone, Code: "ANYONE", Name: "ไม่จำกัด", IsActive: true},
	}
	for i := range eligibilities {
		d.DB.Where("eligibility_id = ?", eligibilities[i].EligibilityID).FirstOrCreate(&eligibilities[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 7. TAGS
	// ═══════════════════════════════════════════════════════════════════════
	tags := []models.Tag{
		{TagID: TagAI, Name: "AI"},
		{TagID: TagWebDev, Name: "Web Development"},
		{TagID: TagStartup, Name: "Startup"},
		{TagID: TagBlockchain, Name: "Blockchain"},
		{TagID: TagDesign, Name: "UX/UI Design"},
	}
	for i := range tags {
		d.DB.Where("tag_id = ?", tags[i].TagID).FirstOrCreate(&tags[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 8. OUTCOMES
	// ═══════════════════════════════════════════════════════════════════════
	outcomes := []models.Outcome{
		{OutcomeID: OutCert, Title: "Certificate of Completion", Description: "ใบประกาศนียบัตรรับรองการเข้าร่วม"},
		{OutcomeID: OutNetwork, Title: "Networking Opportunity", Description: "โอกาสสร้างเครือข่ายกับผู้เชี่ยวชาญและผู้ประกอบการ"},
		{OutcomeID: OutPrize, Title: "Prize & Rewards", Description: "รางวัลเงินสดและของรางวัลสำหรับผู้ชนะ"},
	}
	for i := range outcomes {
		d.DB.Where("outcome_id = ?", outcomes[i].OutcomeID).FirstOrCreate(&outcomes[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 9. SPEAKERS
	// ═══════════════════════════════════════════════════════════════════════
	speakers := []models.Speaker{
		{SpeakerID: Speaker1, DisplayName: "ดร.ปรัชญา ดิจิทัล", Title: "CTO, FutureTech Thailand", Bio: "ผู้เชี่ยวชาญด้าน AI/ML กว่า 15 ปี อดีต Senior Engineer ที่ Google", AvatarFileID: &FileSpeakerAvt},
		{SpeakerID: Speaker2, DisplayName: "คุณวรรณา สตาร์ทอัพ", Title: "CEO & Co-founder, InnoVenture", Bio: "ผู้ก่อตั้งสตาร์ทอัพ FinTech ที่ระดมทุน Series A ได้ 50 ล้านบาท"},
	}
	for i := range speakers {
		d.DB.Where("speaker_id = ?", speakers[i].SpeakerID).FirstOrCreate(&speakers[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 10. EVENTS
	// ═══════════════════════════════════════════════════════════════════════
	events := []models.Event{
		{
			EventID: Event1, OrgID: &OrgCU, LocationID: &LocCUSamyan,
			Name: "CU AI Hackathon 2026", ShortDescription: "แข่งขันพัฒนา AI Solution ภายใน 48 ชั่วโมง ชิงเงินรางวัลกว่า 200,000 บาท",
			Description: "งาน Hackathon ที่ใหญ่ที่สุดของจุฬาฯ ท้าทายนักพัฒนาให้สร้างโซลูชัน AI/ML ที่ช่วยแก้ปัญหาสังคมไทย ผู้เข้าร่วมจะได้เรียนรู้จากผู้เชี่ยวชาญ พร้อมรับ mentorship ตลอดการแข่งขัน",
			EventTypeID: &ETHackathon, FieldID: &FieldAI, ParticipationModeID: &PMOnsite, CompetitionLevelID: &CLOpen,
			StartAt: future, EndAt: future.Add(48 * time.Hour), RegistrationDeadline: &regDeadline,
			Capacity: 200, RemainingSeats: 150, CoverFileID: &FileEventCov1,
			IsSponsored: true, Status: "PUBLISHED", CreatedBy: &UserSomchai,
		},
		{
			EventID: Event2, OrgID: &OrgStartup, LocationID: &LocTrueDigPrk,
			Name: "Startup Weekend Bangkok", ShortDescription: "สัมมนาเชิงปฏิบัติการสำหรับคนที่สนใจเริ่มต้นสตาร์ทอัพ",
			Description: "Startup Weekend คืองาน 3 วันเต็มที่จะพาคุณจากไอเดียสู่ต้นแบบธุรกิจจริง เรียนรู้การ pitch, การวิเคราะห์ตลาด, และการสร้างทีม",
			EventTypeID: &ETWorkshop, FieldID: &FieldBiz, ParticipationModeID: &PMOnsite, CompetitionLevelID: &CLBeginner,
			StartAt: future.AddDate(0, 0, 7), EndAt: future.AddDate(0, 0, 10),
			Capacity: 80, RemainingSeats: 45, CoverFileID: &FileEventCov2,
			IsSponsored: false, Status: "PUBLISHED", CreatedBy: &UserNattawut,
		},
		{
			EventID: Event3, OrgID: &OrgTU, LocationID: &LocTURangsit,
			Name: "TU Data Science Conference 2026", ShortDescription: "งานประชุมวิชาการด้าน Data Science ระดับอาเซียน",
			Description: "การประชุมวิชาการระดับนานาชาติที่รวบรวมนักวิจัย นักวิทยาศาสตร์ข้อมูล และผู้เชี่ยวชาญจากทั่วอาเซียน มานำเสนอผลงานวิจัยด้าน Data Science, Machine Learning และ Big Data Analytics",
			EventTypeID: &ETConference, FieldID: &FieldData, ParticipationModeID: &PMHybrid, CompetitionLevelID: &CLAdvanced,
			StartAt: past, EndAt: past.Add(16 * time.Hour),
			Capacity: 500, RemainingSeats: 0,
			IsSponsored: true, Status: "COMPLETED", CreatedBy: &UserSiriporn,
		},
	}
	for i := range events {
		d.DB.Where("event_id = ?", events[i].EventID).FirstOrCreate(&events[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 11. EVENT ↔ TAGS
	// ═══════════════════════════════════════════════════════════════════════
	eventTags := []models.EventTag{
		{EventID: Event1, TagID: TagAI},
		{EventID: Event1, TagID: TagWebDev},
		{EventID: Event2, TagID: TagStartup},
		{EventID: Event2, TagID: TagDesign},
		{EventID: Event3, TagID: TagAI},
		{EventID: Event3, TagID: TagBlockchain},
	}
	for i := range eventTags {
		d.DB.Where("event_id = ? AND tag_id = ?", eventTags[i].EventID, eventTags[i].TagID).FirstOrCreate(&eventTags[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 12. EVENT ↔ ELIGIBILITIES
	// ═══════════════════════════════════════════════════════════════════════
	eventEligs := []models.EventEligibility{
		{EventID: Event1, EligibilityID: EligStudent},
		{EventID: Event1, EligibilityID: EligPro},
		{EventID: Event2, EligibilityID: EligAnyone},
		{EventID: Event3, EligibilityID: EligPro},
	}
	for i := range eventEligs {
		d.DB.Where("event_id = ? AND eligibility_id = ?", eventEligs[i].EventID, eventEligs[i].EligibilityID).FirstOrCreate(&eventEligs[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 13. EVENT ↔ OUTCOMES
	// ═══════════════════════════════════════════════════════════════════════
	eventOutcomes := []models.EventOutcome{
		{EventID: Event1, OutcomeID: OutCert, Position: 1},
		{EventID: Event1, OutcomeID: OutPrize, Position: 2},
		{EventID: Event2, OutcomeID: OutCert, Position: 1},
		{EventID: Event2, OutcomeID: OutNetwork, Position: 2},
		{EventID: Event3, OutcomeID: OutCert, Position: 1},
	}
	for i := range eventOutcomes {
		d.DB.Where("event_id = ? AND outcome_id = ?", eventOutcomes[i].EventID, eventOutcomes[i].OutcomeID).FirstOrCreate(&eventOutcomes[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 14. EVENT AGENDA ITEMS
	// ═══════════════════════════════════════════════════════════════════════
	start09 := future.Truncate(24 * time.Hour).Add(9 * time.Hour)
	start10 := start09.Add(1 * time.Hour)
	start13 := start09.Add(4 * time.Hour)
	start15 := start09.Add(6 * time.Hour)
	end10 := start10
	end12 := start09.Add(3 * time.Hour)
	end15 := start15
	end17 := start09.Add(8 * time.Hour)

	agendas := []models.EventAgendaItem{
		{AgendaItemID: uuid.MustParse("f8000000-0000-0000-0000-000000000001"), EventID: Event1, StartAt: &start09, EndAt: &end10, Title: "ลงทะเบียนและกล่าวเปิดงาน", Description: "ลงทะเบียน รับชุดอุปกรณ์ และกล่าวเปิดงานโดยอธิการบดี", Position: 1},
		{AgendaItemID: uuid.MustParse("f8000000-0000-0000-0000-000000000002"), EventID: Event1, StartAt: &start10, EndAt: &end12, Title: "Workshop: AI/ML Fundamentals", Description: "เวิร์คช้อปปูพื้นฐาน ML Pipeline สำหรับผู้เข้าแข่งขัน", Position: 2},
		{AgendaItemID: uuid.MustParse("f8000000-0000-0000-0000-000000000003"), EventID: Event1, StartAt: &start13, EndAt: &end15, Title: "เริ่มแข่งขัน Hackathon", Description: "ทีมเริ่มพัฒนาโปรเจกต์ มี mentor คอยให้คำปรึกษา", Position: 3},
		{AgendaItemID: uuid.MustParse("f8000000-0000-0000-0000-000000000004"), EventID: Event1, StartAt: &start15, EndAt: &end17, Title: "Final Pitch & ประกาศผล", Description: "ทีมนำเสนอผลงาน 5 นาที/ทีม กรรมการตัดสินและประกาศผล", Position: 4},
	}
	for i := range agendas {
		d.DB.Where("agenda_item_id = ?", agendas[i].AgendaItemID).FirstOrCreate(&agendas[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 15. EVENT ↔ SPEAKERS
	// ═══════════════════════════════════════════════════════════════════════
	eventSpeakers := []models.EventSpeaker{
		{EventID: Event1, SpeakerID: Speaker1, Role: "SPEAKER", Position: 1},
		{EventID: Event1, SpeakerID: Speaker2, Role: "PANELIST", Position: 2},
		{EventID: Event2, SpeakerID: Speaker2, Role: "HOST", Position: 1},
		{EventID: Event3, SpeakerID: Speaker1, Role: "SPEAKER", Position: 1},
	}
	for i := range eventSpeakers {
		d.DB.Where("event_id = ? AND speaker_id = ?", eventSpeakers[i].EventID, eventSpeakers[i].SpeakerID).FirstOrCreate(&eventSpeakers[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 16. EVENT FILES
	// ═══════════════════════════════════════════════════════════════════════
	eventFiles := []models.EventFile{
		{EventFileID: uuid.MustParse("f9000000-0000-0000-0000-000000000001"), EventID: Event1, FileID: FileMedia1, Role: "gallery", Sequence: 1},
		{EventFileID: uuid.MustParse("f9000000-0000-0000-0000-000000000002"), EventID: Event1, FileID: FileMedia2, Role: "gallery", Sequence: 2},
	}
	for i := range eventFiles {
		d.DB.Where("event_file_id = ?", eventFiles[i].EventFileID).FirstOrCreate(&eventFiles[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 17. EVENT TICKET TYPES
	// ═══════════════════════════════════════════════════════════════════════
	ticketTypes := []models.EventTicketType{
		{TicketTypeID: TicketFree1, EventID: Event1, Name: "Standard (ฟรี)", Price: 0, Currency: "THB", Capacity: 150},
		{TicketTypeID: TicketVIP1, EventID: Event1, Name: "VIP (รวมอาหาร + เสื้อ)", Price: 500, Currency: "THB", Capacity: 50},
		{TicketTypeID: TicketFree2, EventID: Event2, Name: "General Admission", Price: 0, Currency: "THB", Capacity: 80},
	}
	for i := range ticketTypes {
		d.DB.Where("ticket_type_id = ?", ticketTypes[i].TicketTypeID).FirstOrCreate(&ticketTypes[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 18. EVENT REGISTRATIONS
	// ═══════════════════════════════════════════════════════════════════════
	attended := past.Add(2 * time.Hour)
	registrations := []models.EventRegistration{
		{RegistrationID: Reg1, EventID: Event1, UserID: UserSomchai, TicketTypeID: &TicketFree1, Status: "REGISTERED"},
		{RegistrationID: Reg2, EventID: Event1, UserID: UserPloy, TicketTypeID: &TicketVIP1, Status: "REGISTERED"},
		{RegistrationID: Reg3, EventID: Event2, UserID: UserNattawut, TicketTypeID: &TicketFree2, Status: "REGISTERED"},
		{RegistrationID: Reg4, EventID: Event3, UserID: UserSiriporn, Status: "ATTENDED", AttendedAt: &attended},
	}
	for i := range registrations {
		d.DB.Where("registration_id = ?", registrations[i].RegistrationID).FirstOrCreate(&registrations[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 19. EVENT BOOKMARKS
	// ═══════════════════════════════════════════════════════════════════════
	bookmarks := []models.EventBookmark{
		{UserID: UserSomchai, EventID: Event2},
		{UserID: UserPloy, EventID: Event1},
		{UserID: UserNattawut, EventID: Event1},
		{UserID: UserSiriporn, EventID: Event2},
	}
	for i := range bookmarks {
		d.DB.Where("user_id = ? AND event_id = ?", bookmarks[i].UserID, bookmarks[i].EventID).FirstOrCreate(&bookmarks[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 20. EVENT VIEWS
	// ═══════════════════════════════════════════════════════════════════════
	eventViews := []models.EventView{
		{ViewID: uuid.MustParse("fa000000-0000-0000-0000-000000000001"), UserID: &UserSomchai, EventID: Event1},
		{ViewID: uuid.MustParse("fa000000-0000-0000-0000-000000000002"), UserID: &UserPloy, EventID: Event1},
		{ViewID: uuid.MustParse("fa000000-0000-0000-0000-000000000003"), UserID: &UserNattawut, EventID: Event2},
		{ViewID: uuid.MustParse("fa000000-0000-0000-0000-000000000004"), UserID: nil, EventID: Event1}, // anonymous view
		{ViewID: uuid.MustParse("fa000000-0000-0000-0000-000000000005"), UserID: &UserSiriporn, EventID: Event3},
	}
	for i := range eventViews {
		d.DB.Where("view_id = ?", eventViews[i].ViewID).FirstOrCreate(&eventViews[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 21. MEDAL VERSE CODES
	// ═══════════════════════════════════════════════════════════════════════
	codeExpiry := future.AddDate(0, 3, 0)
	mvCodes := []models.MedalVerseCode{
		{CodeID: Code1, Code: "CUAI2026", EventID: Event1, MaxUses: 200, UsedCount: 50, ExpiresAt: &codeExpiry, IsActive: true},
		{CodeID: Code2, Code: "STARTUP-BKK", EventID: Event2, MaxUses: 80, UsedCount: 35, ExpiresAt: &codeExpiry, IsActive: true},
	}
	for i := range mvCodes {
		d.DB.Where("code_id = ?", mvCodes[i].CodeID).FirstOrCreate(&mvCodes[i])
	}

	// ═══════════════════════════════════════════════════════════════════════
	// 22. CREDENTIALS
	// ═══════════════════════════════════════════════════════════════════════
	credentials := []models.Credential{
		{
			CredentialID: Cred1, EventID: Event3, UserID: UserSiriporn, RegistrationID: &Reg4,
			Name: "Certificate of Attendance", Type: models.CredentialTypeCertificate,
			RecipientName: "ศิริพร จันทร์สว่าง", FieldID: &FieldData, KeyLearning: "Advanced Data Analytics, Big Data Pipeline Architecture",
			IssueDate: past.Add(24 * time.Hour), IsPrivate: false,
		},
		{
			CredentialID: Cred2, EventID: Event3, UserID: UserNattawut,
			Name: "Best Paper Award", Type: models.CredentialTypeTrophy,
			RecipientName: "ณัฐวุฒิ เทคโนโลยี", FieldID: &FieldAI, Rank: "1st Place",
			KeyLearning: "Transformer-based models for Thai NLP", IssueDate: past.Add(24 * time.Hour), IsPrivate: false,
		},
		{
			CredentialID: Cred3, EventID: Event1, UserID: UserSomchai, RegistrationID: &Reg1,
			Name: "Hackathon Participation Badge", Type: models.CredentialTypeBadge,
			RecipientName: "สมชาย รักเรียน", FieldID: &FieldTech,
			KeyLearning: "End-to-end AI solution development", IsPrivate: true,
		},
	}
	for i := range credentials {
		d.DB.Where("credential_id = ?", credentials[i].CredentialID).FirstOrCreate(&credentials[i])
	}

	log.Println("✅ Seeding completed successfully!")
	return nil
}

// SeedIfEmpty seeds the database only if the users table is empty.
func (d *Database) SeedIfEmpty() error {
	var count int64
	d.DB.Model(&models.User{}).Count(&count)
	if count > 0 {
		log.Println("Database already has data, skipping seed.")
		return nil
	}
	return d.Seed()
}

// CleanAndSeed truncates all tables and re-seeds. Use for testing only!
func (d *Database) CleanAndSeed() error {
	log.Println("🧹 Cleaning database...")

	tables := []string{
		"credentials", "medal_verse_codes",
		"event_views", "event_bookmarks", "event_registrations", "event_ticket_types",
		"event_speakers", "event_agenda_items", "event_outcomes", "event_eligibilities",
		"event_tags", "event_media",
		"events",
		"speakers", "outcomes", "tags", "eligibility_groups",
		"competition_levels", "participation_modes", "fields", "event_types",
		"locations", "organization_members", "organizations",
		"files", "users",
	}

	for _, table := range tables {
		d.DB.Exec("DELETE FROM " + table)
	}

	return d.Seed()
}
