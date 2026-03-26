package services

import (
	"context"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/aws/aws-sdk-go-v2/service/ses/types"

	appConfig "medalverse-be/internal/config"
)

type EmailService interface {
	SendVerificationCode(ctx context.Context, toAddress string, code string) error
}

type SESEmailService struct {
	client *ses.Client
	sender string
}

func NewSESEmailService(cfg *appConfig.Config) EmailService {
	awsCfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(cfg.Storage.AWSRegion),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.Storage.AWSAccessKey,
			cfg.Storage.AWSSecretKey,
			"",
		)),
	)
	if err != nil {
		log.Printf("Failed to load AWS config for SES: %v", err)
	}

	client := ses.NewFromConfig(awsCfg)

	return &SESEmailService{
		client: client,
		sender: cfg.Storage.AWSSESSender,
	}
}

func (s *SESEmailService) SendVerificationCode(ctx context.Context, toAddress string, code string) error {
	// If the user hasn't configured AWS credentials, fall back to logging the code (simulation format)
	if s.sender == "" || s.sender == "noreply@medalverse.com" {
		fmt.Printf("\n=======================================================\n")
		fmt.Printf("[Email Simulator Dashboard] To: %s\n", toAddress)
		fmt.Printf("[Email Simulator Dashboard] Subject: MedalVerse Verification Code\n")
		fmt.Printf("[Email Simulator Dashboard] Action: Your 6-digit verification code is %s\n", code)
		fmt.Printf("=======================================================\n\n")
		log.Println("Note: Real email not sent because AWS credentials or AWS_SES_SENDER are not configured.")
		return nil
	}

	subject := "Your MedalVerse Verification Code"
	htmlBody := fmt.Sprintf(`
		<html>
		<head></head>
		<body>
			<h1>Welcome to MedalVerse!</h1>
			<p>Your 6-digit email verification code is: <strong>%s</strong></p>
			<p>Please enter this code in the app to complete your registration. This code will expire in 24 hours.</p>
		</body>
		</html>
	`, code)
	textBody := fmt.Sprintf("Welcome to MedalVerse! Your 6-digit email verification code is: %s\nThis code will expire in 24 hours.", code)

	input := &ses.SendEmailInput{
		Destination: &types.Destination{
			ToAddresses: []string{toAddress},
		},
		Message: &types.Message{
			Body: &types.Body{
				Html: &types.Content{
					Charset: aws.String("UTF-8"),
					Data:    aws.String(htmlBody),
				},
				Text: &types.Content{
					Charset: aws.String("UTF-8"),
					Data:    aws.String(textBody),
				},
			},
			Subject: &types.Content{
				Charset: aws.String("UTF-8"),
				Data:    aws.String(subject),
			},
		},
		Source: aws.String(s.sender),
	}

	_, err := s.client.SendEmail(ctx, input)
	if err != nil {
		log.Printf("Failed to send verification email via SES to %s: %v", toAddress, err)
		return fmt.Errorf("failed to send verification email: %w", err)
	}

	return nil
}
