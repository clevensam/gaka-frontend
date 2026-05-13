-- Seed data: Year 3 Semester 2 Modules
-- Run this in your Supabase SQL Editor

INSERT INTO public.modules (code, name, description, year, semester)
VALUES
  ('ST 8121', 'Queuing Theory and Inventory Models', 'Study of queueing systems and inventory management models.', 3, 2),
  ('CS 8308', 'E-Commerce', 'Principles and technologies behind electronic commerce.', 3, 2),
  ('CS 8309', 'Trends in Changing Information Technology', 'Emerging trends and evolving landscape of information technology.', 3, 2),
  ('CS 8310', 'Implementation of Databases', 'Practical implementation and management of database systems.', 3, 2),
  ('CS 8311', 'Visual Application Development', 'Development of visually-driven applications using modern frameworks.', 3, 2),
  ('CS 8312', 'Management Information System', 'Information systems used for managerial decision-making.', 3, 2),
  ('CS 8313', 'Final Year Project 2', 'Continuation and completion of the final year capstone project.', 3, 2)
ON CONFLICT (code) DO NOTHING;
