
-- Drops the task_saver_db if it already exists --
DROP DATABASE IF EXISTS wishes_db;

-- Create the database task_saver_db and specified it for use.
CREATE DATABASE wishes_db;

USE wishes_db;

-- Create the table tasks.
CREATE TABLE wish (
  id int NOT NULL AUTO_INCREMENT,
  wish varchar(255) NOT NULL,
  PRIMARY KEY (id)
);

-- Insert a set of records.
INSERT INTO wish (wish) VALUES ('Win lottery');
INSERT INTO wish (wish) VALUES ('Cowboys win suberbowl');
INSERT INTO wish (wish) VALUES ('Peace on Earth');



