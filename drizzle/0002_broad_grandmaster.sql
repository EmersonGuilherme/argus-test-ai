CREATE TABLE `consent_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`purpose` varchar(255) NOT NULL,
	`legalBasis` enum('consent','legitimate_interest','contract','legal_obligation','vital_interest','public_interest') NOT NULL,
	`granted` boolean NOT NULL DEFAULT true,
	`ipAddress` varchar(45),
	`userAgent` text,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consent_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_retention_policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`dataType` enum('traces','evaluations','security_tests','test_runs','all') NOT NULL,
	`retentionDays` int NOT NULL DEFAULT 90,
	`autoDelete` boolean NOT NULL DEFAULT false,
	`anonymizeOnExpiry` boolean NOT NULL DEFAULT true,
	`lastCleanupAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `data_retention_policies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `org_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orgId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','editor','viewer') NOT NULL DEFAULT 'viewer',
	`invitedBy` int,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `org_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`ownerId` int NOT NULL,
	`plan` enum('free','pro','enterprise') NOT NULL DEFAULT 'free',
	`maxMembers` int DEFAULT 5,
	`settings` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `pii_masking_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`fieldPattern` varchar(255) NOT NULL,
	`maskType` enum('full','partial','hash','tokenize') NOT NULL DEFAULT 'full',
	`dataCategory` enum('cpf','email','phone','credit_card','name','address','custom') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pii_masking_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `test_cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runId` int NOT NULL,
	`category` varchar(128) NOT NULL,
	`input` text NOT NULL,
	`expectedBehavior` text,
	`actualOutput` text,
	`status` enum('passed','failed','error','skipped') NOT NULL DEFAULT 'skipped',
	`severity` enum('critical','high','medium','low') NOT NULL DEFAULT 'medium',
	`score` float,
	`reasoning` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `test_cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `test_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`type` enum('red_team','regression','fuzzing','generated','compliance') NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`totalCases` int DEFAULT 0,
	`passedCases` int DEFAULT 0,
	`failedCases` int DEFAULT 0,
	`score` float,
	`summary` text,
	`aiAnalysis` text,
	`config` json,
	`triggeredBy` enum('manual','scheduled','ci_cd') NOT NULL DEFAULT 'manual',
	`scheduleCronTaskUid` varchar(65),
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `test_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`type` enum('slack','discord','email','custom') NOT NULL,
	`events` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`secret` varchar(255),
	`lastTriggeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
