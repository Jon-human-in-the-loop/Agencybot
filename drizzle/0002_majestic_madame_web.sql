CREATE TABLE `app_integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`category` enum('crm','marketing','calendar','payments','social','analytics','notifications','ecommerce','productivity','ai','storage','other') NOT NULL,
	`provider` varchar(64) NOT NULL,
	`description` text,
	`icon` varchar(8) DEFAULT '🔌',
	`iconUrl` text,
	`color` varchar(32) DEFAULT '#6366F1',
	`isConnected` boolean DEFAULT false,
	`isActive` boolean DEFAULT false,
	`credentials` json,
	`settings` json,
	`webhookUrl` text,
	`lastSyncAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `app_integrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `app_integrations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `bot_integration_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botProfileId` int,
	`voiceAgentId` int,
	`integrationId` int NOT NULL,
	`isEnabled` boolean DEFAULT true,
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bot_integration_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integration_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`integrationId` int NOT NULL,
	`eventType` varchar(128) NOT NULL,
	`payload` json,
	`status` enum('pending','success','failed','retrying') DEFAULT 'pending',
	`errorMessage` text,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `integration_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `voice_agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`role` varchar(128) NOT NULL,
	`department` varchar(64) NOT NULL DEFAULT 'general',
	`avatar` varchar(8) NOT NULL DEFAULT '📞',
	`description` text,
	`systemPrompt` text NOT NULL,
	`welcomeMessage` text,
	`voiceId` varchar(128) DEFAULT 'default',
	`voiceProvider` enum('elevenlabs','openai_tts','google_tts','browser') DEFAULT 'browser',
	`sttProvider` enum('deepgram','openai_whisper','google_stt','browser') DEFAULT 'browser',
	`language` varchar(16) DEFAULT 'es',
	`llmConfigId` int,
	`isActive` boolean DEFAULT true,
	`twilioPhoneNumber` varchar(32),
	`twilioAccountSid` text,
	`twilioAuthToken` text,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `voice_agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `voice_agents_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `voice_calls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`callId` varchar(128) NOT NULL,
	`voiceAgentId` int NOT NULL,
	`callerPhone` varchar(32),
	`callerName` varchar(256),
	`channel` enum('twilio','simulator','web') DEFAULT 'simulator',
	`status` enum('ringing','active','completed','failed','missed') DEFAULT 'ringing',
	`durationSeconds` int,
	`transcript` text,
	`summary` text,
	`sentiment` enum('positive','neutral','negative') DEFAULT 'neutral',
	`recordingUrl` text,
	`metadata` json,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`endedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `voice_calls_id` PRIMARY KEY(`id`),
	CONSTRAINT `voice_calls_callId_unique` UNIQUE(`callId`)
);
