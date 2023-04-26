-- SQL 描述文件, 一般用来初始化插件数据库， 可以配合 ImportSql() 使用
-- 注意⚠️：表名需要用 {{}} 括起来
DROP TABLE IF exists `{{project_role_map}}`;

CREATE TABLE `{{project_role_map}}` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT 'key',
  `project_uuid` varchar(128) NOT NULL COMMENT '项目id',
  `role_uuid` varchar(128) NOT NULL COMMENT '角色id',
  `relation_uuid` varchar(128) NOT NULL COMMENT '关联id', 
  `relation_type` tinyint NOT NULL COMMENT '关联类型 1: 部门, 2: 用户组',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='项目角色与部门用户组映射表';

DROP TABLE IF exists `{{project_user_sync}}`;
CREATE TABLE `{{project_user_sync}}` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT 'key',
  `project_uuid` varchar(128) NOT NULL COMMENT '项目id',
  `role_uuid` varchar(128)  NOT NULL COMMENT '角色id',
  `user_uuid` varchar(128) NOT NULL COMMENT '用户id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='同步用户';


DROP TABLE IF exists `{{project_user_sync_cron}}`;
CREATE TABLE `{{project_user_sync_cron}}` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT 'key',
  `interval` int NOT NULL COMMENT '间隔',
  `unit` tinyint NOT NULL COMMENT '单位',
  `next_at` bigint NOT NULL COMMENT '下次执行时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='同步用户定时任务';

INSERT INTO `{{project_user_sync_cron}}`(`interval`,`unit`,`next_at`) values (1,1,UNIX_TIMESTAMP(TIMESTAMPADD(MINUTE,1,NOW())));