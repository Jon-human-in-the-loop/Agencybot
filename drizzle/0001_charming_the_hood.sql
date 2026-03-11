CREATE TABLE `bot_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`role` varchar(128) NOT NULL,
	`department` enum('creative','strategy','content','social','analytics','seo','community','accounts','design','management') NOT NULL,
	`avatar` varchar(8) NOT NULL DEFAULT '🤖',
	`avatarColor` varchar(32) DEFAULT '#00D084',
	`description` text,
	`systemPrompt` text NOT NULL,
	`welcomeMessage` text,
	`personality` json,
	`capabilities` json,
	`llmConfigId` int,
	`isActive` boolean DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bot_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `bot_profiles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `conversation_flows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botProfileId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`trigger` varchar(512),
	`steps` json NOT NULL,
	`isActive` boolean DEFAULT true,
	`priority` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversation_flows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`botProfileId` int NOT NULL,
	`userId` int,
	`clientName` varchar(256),
	`clientPhone` varchar(32),
	`channel` enum('whatsapp','simulator','web','api') DEFAULT 'simulator',
	`status` enum('active','closed','paused','escalated') DEFAULT 'active',
	`context` json,
	`metadata` json,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`lastActivityAt` timestamp NOT NULL DEFAULT (now()),
	`closedAt` timestamp,
	`satisfactionScore` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversation_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `conversation_sessions_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `llm_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`provider` enum('openai','anthropic','gemini','groq','ollama','openrouter','custom') NOT NULL,
	`model` varchar(128) NOT NULL,
	`apiKey` text,
	`baseUrl` text,
	`maxTokens` int DEFAULT 2048,
	`temperature` float DEFAULT 0.7,
	`isDefault` boolean DEFAULT false,
	`isActive` boolean DEFAULT true,
	`extraParams` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `llm_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`tokensUsed` int,
	`responseTimeMs` int,
	`llmProvider` varchar(64),
	`llmModel` varchar(128),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botProfileId` int NOT NULL,
	`date` timestamp NOT NULL,
	`totalConversations` int DEFAULT 0,
	`activeConversations` int DEFAULT 0,
	`closedConversations` int DEFAULT 0,
	`totalMessages` int DEFAULT 0,
	`avgResponseTimeMs` int DEFAULT 0,
	`avgSatisfactionScore` float DEFAULT 0,
	`totalTokensUsed` bigint DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `response_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botProfileId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`trigger` varchar(256),
	`content` text NOT NULL,
	`category` varchar(64),
	`variables` json,
	`isActive` boolean DEFAULT true,
	`usageCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `response_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botProfileId` int NOT NULL,
	`instanceName` varchar(128) NOT NULL,
	`evolutionApiUrl` text,
	`evolutionApiKey` text,
	`phoneNumber` varchar(32),
	`status` enum('disconnected','connecting','connected','error') DEFAULT 'disconnected',
	`qrCode` text,
	`lastConnectedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsapp_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `whatsapp_connections_botProfileId_unique` UNIQUE(`botProfileId`)
);
