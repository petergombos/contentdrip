CREATE TABLE IF NOT EXISTS `send_log` (
	`id` text PRIMARY KEY NOT NULL,
	`subscription_id` text NOT NULL,
	`pack_key` text NOT NULL,
	`step_slug` text NOT NULL,
	`provider` text NOT NULL,
	`provider_message_id` text,
	`status` text NOT NULL,
	`sent_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`error` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `send_log_subscription_id_idx` ON `send_log` (`subscription_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `send_log_pack_key_idx` ON `send_log` (`pack_key`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `send_log_sent_at_idx` ON `send_log` (`sent_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`pack_key` text NOT NULL,
	`timezone` text NOT NULL,
	`cron_expression` text NOT NULL,
	`status` text DEFAULT 'PENDING_CONFIRM' NOT NULL,
	`current_step_index` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `subscriptions_email_idx` ON `subscriptions` (`email`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `subscriptions_status_idx` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `subscriptions_pack_key_idx` ON `subscriptions` (`pack_key`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`subscription_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`token_type` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tokens_subscription_id_idx` ON `tokens` (`subscription_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tokens_token_hash_idx` ON `tokens` (`token_hash`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tokens_token_type_idx` ON `tokens` (`token_type`);