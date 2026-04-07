
-- Reset tournament to upcoming so admin can generate bracket from the UI
UPDATE tournaments SET status = 'upcoming' WHERE id = '2976994e-aaf9-4d9f-809c-6b911933c79b';
-- Update participant count
UPDATE tournaments SET current_participants = 4 WHERE id = '2976994e-aaf9-4d9f-809c-6b911933c79b';
