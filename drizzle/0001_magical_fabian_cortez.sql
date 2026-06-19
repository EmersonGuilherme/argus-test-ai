CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`type` enum('threshold_breach','model_drift','cost_spike','security_threat','performance_degradation') NOT NULL,
	`severity` enum('critical','high','medium','low') NOT NULL DEFAULT 'medium',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`metric` varchar(128),
	`currentValue` float,
	`thresholdValue` float,
	`isResolved` boolean NOT NULL DEFAULT false,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`keyHash` varchar(128) NOT NULL,
	`keyPrefix` varchar(12) NOT NULL,
	`lastUsedAt` timestamp,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`traceId` int,
	`model` varchar(128) NOT NULL,
	`prompt` text NOT NULL,
	`response` text NOT NULL,
	`hallucination` float,
	`relevance` float,
	`faithfulness` float,
	`toxicity` float,
	`overallScore` float,
	`latency` int,
	`costPerToken` float,
	`totalTokens` int,
	`totalCost` float,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`type` enum('github','datadog','kafka','aws','slack','langfuse','langsmith') NOT NULL,
	`name` varchar(255) NOT NULL,
	`config` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`environment` enum('development','staging','production') NOT NULL DEFAULT 'development',
	`status` enum('active','paused','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prompt_suggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`evaluationId` int,
	`currentPrompt` text NOT NULL,
	`suggestedPrompt` text NOT NULL,
	`improvementReason` text,
	`estimatedImpact` float,
	`status` enum('pending','applied','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `prompt_suggestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_tests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`testType` enum('prompt_injection','data_leakage','jailbreak','validation_bypass','pii_exposure','model_extraction') NOT NULL,
	`severity` enum('critical','high','medium','low','info') NOT NULL DEFAULT 'medium',
	`status` enum('vulnerable','safe','partial') NOT NULL DEFAULT 'safe',
	`attackPayload` text,
	`response` text,
	`description` text,
	`suggestion` text,
	`suggestedPrompt` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `security_tests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trace_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`traceId` int NOT NULL,
	`stepOrder` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`serviceType` enum('api_gateway','lambda','agent_ai','kafka','database','external_api','queue','cache','mainframe') NOT NULL,
	`status` enum('success','failed','warning') NOT NULL DEFAULT 'success',
	`duration` int,
	`inputData` json,
	`outputData` json,
	`errorMessage` text,
	`errorField` varchar(255),
	`prompt` text,
	`llmResponse` text,
	`model` varchar(128),
	`tokensUsed` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trace_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `traces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`traceId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`status` enum('success','failed','running','timeout') NOT NULL DEFAULT 'running',
	`totalDuration` int,
	`totalSteps` int DEFAULT 0,
	`failedStep` varchar(255),
	`failedField` varchar(255),
	`rootCause` enum('ai','code','infrastructure','unknown') DEFAULT 'unknown',
	`rootCauseDetail` text,
	`financialImpact` float,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `traces_id` PRIMARY KEY(`id`)
);
