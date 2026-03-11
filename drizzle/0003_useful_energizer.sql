CREATE TABLE `admin_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`settingKey` varchar(128) NOT NULL,
	`settingValue` text,
	`isPublic` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `encrypted_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`service` enum('openai','anthropic','gemini','groq','ollama','openrouter','twilio','whatsapp','hubspot','mailchimp','stripe','google_calendar','slack','notion','instagram','brevo','pipedrive','n8n','make','google_sheets','telegram','discord','custom') NOT NULL,
	`credentialName` varchar(128) NOT NULL,
	`encryptedValue` text NOT NULL,
	`credentialHash` varchar(64) NOT NULL,
	`isActive` boolean DEFAULT true,
	`lastTestedAt` timestamp,
	`testStatus` enum('untested','valid','invalid','expired') DEFAULT 'untested',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `encrypted_credentials_id` PRIMARY KEY(`id`)
);
