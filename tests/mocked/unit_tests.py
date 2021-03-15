import unittest
import unittest.mock as mock
from unittest.mock import patch
import os
import sys

# This lets you import from the parent directory (one level up)
sys.path.append(os.path.dirname(os.path.abspath('../')))
from app import add_player
#import models
from app import models

KEY_INPUT = "input"
KEY_EXPECTED = "expected"

INITIAL_USERNAME = 'Deep'

class AddUserTestCase(unittest.TestCase):
    def setUp(self):
        self.success_test_params = [
            {
                KEY_INPUT: 'Deep',
                KEY_EXPECTED: False,
            },
            
            {
                KEY_INPUT: 'New_User',
                KEY_EXPECTED: True,
            },
            
            {
                KEY_INPUT: 'New_User_2',
                KEY_EXPECTED: True,
            },
        ]
        
        self.fail_test_params = [
            {
                KEY_INPUT: 'Deep',
                KEY_EXPECTED: True,
            },
            
            {
                KEY_INPUT: 'New_User',
                KEY_EXPECTED: False,
            },
            
            {
                KEY_INPUT: 'New_User',
                KEY_EXPECTED: True,
            },
        ]

        initial_person = models.Player(username=INITIAL_USERNAME, points=100)
        self.initial_db_mock = [initial_person]

    def mocked_db_session_add(self, username):
        self.initial_db_mock.append(username)
    
    def mocked_db_session_commit(self):
        pass
    
    def mocked_query_all(self):
        return self.initial_db_mock
        
    def test_success(self):
        for test in self.success_test_params:
            with patch("models.Player.query") as mocked_query:
                mocked_query.all = self.mocked_query_all
                
                with patch("app.DB.session.add", self.mocked_db_session_add):
                    with patch("app.DB.session.commit", self.mocked_db_session_commit):

                        actual_result = add_player(test[KEY_INPUT])
                        expected_result = test[KEY_EXPECTED]

                        self.assertEqual(actual_result, expected_result)
                        self.assertIs(actual_result, expected_result)
    
    def test_fail(self):
        for test in self.fail_test_params:
            with patch("models.Player.query") as mocked_query:
                mocked_query.all = self.mocked_query_all
                
                with patch("app.DB.session.add", self.mocked_db_session_add):
                    with patch("app.DB.session.commit", self.mocked_db_session_commit):

                        actual_result = add_player(test[KEY_INPUT])
                        expected_result = test[KEY_EXPECTED]

                        self.assertNotEqual(actual_result, expected_result)
                        self.assertIsNot(actual_result, expected_result)

if __name__ == '__main__':
    unittest.main()