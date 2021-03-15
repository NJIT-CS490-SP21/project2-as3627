import unittest
import unittest.mock as mock
from unittest.mock import patch
import os
import sys

# This lets you import from the parent directory (one level up)
sys.path.append(os.path.dirname(os.path.abspath('../')))
from app import add_player, print_players
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
                    with patch("app.DB.session.commit",
                               self.mocked_db_session_commit):

                        actual_result = add_player(test[KEY_INPUT])
                        expected_result = test[KEY_EXPECTED]

                        self.assertEqual(actual_result, expected_result)
                        self.assertIs(actual_result, expected_result)

    def test_fail(self):
        for test in self.fail_test_params:
            with patch("models.Player.query") as mocked_query:
                mocked_query.all = self.mocked_query_all

                with patch("app.DB.session.add", self.mocked_db_session_add):
                    with patch("app.DB.session.commit",
                               self.mocked_db_session_commit):

                        actual_result = add_player(test[KEY_INPUT])
                        expected_result = test[KEY_EXPECTED]

                        self.assertNotEqual(actual_result, expected_result)
                        self.assertIsNot(actual_result, expected_result)


# Mocks the print_players() function, which orders the usernames by descending points.
class PlayersTestCase(unittest.TestCase):
    def setUp(self):

        initial_person_A = models.Player(username="PlayerA", points=120)
        initial_person_B = models.Player(username="PlayerB", points=60)
        initial_person_C = models.Player(username="PlayerC", points=100)

        self.success_test_params = [
            {
                KEY_INPUT: [initial_person_A],
                KEY_EXPECTED: ["PlayerA"],
            },
            {
                KEY_INPUT: [initial_person_A, initial_person_B],
                KEY_EXPECTED: ["PlayerA", "PlayerB"],
            },
            {
                KEY_INPUT:
                [initial_person_A, initial_person_B, initial_person_C],
                KEY_EXPECTED: ["PlayerA", "PlayerC", "PlayerB"],
            },
        ]

        self.fail_test_params = [
            {
                KEY_INPUT: [initial_person_B, initial_person_A],
                KEY_EXPECTED: ["PlayerB", "PlayerA"],
            },
            {
                KEY_INPUT:
                [initial_person_A, initial_person_B, initial_person_C],
                KEY_EXPECTED: ["PlayerA", "PlayerB", "PlayerC"],
            },
            {
                KEY_INPUT:
                [initial_person_C, initial_person_B, initial_person_A],
                KEY_EXPECTED: ["PlayerB", "PlayerC", "PlayerA"],
            },
        ]

    def mocked_query_desc(self, val):
        self.initial_db_mock.sort(key=lambda x: x.points, reverse=True)
        usernames = []
        for i in self.initial_db_mock:
            usernames.append(i.username)
        return usernames

    def test_success(self):
        for test in self.success_test_params:
            with patch("app.DB.session.query") as mocked_query:
                mocked_query.return_value.order_by = self.mocked_query_desc
                self.initial_db_mock = []
                for i in test[KEY_INPUT]:
                    self.initial_db_mock.append(i)

                actual_result = print_players()
                expected_result = test[KEY_EXPECTED]

                self.assertEqual(len(actual_result), len(expected_result))
                self.assertEqual(actual_result, expected_result)

    def test_fail(self):
        for test in self.fail_test_params:
            with patch("app.DB.session.query") as mocked_query:
                mocked_query.return_value.order_by = self.mocked_query_desc
                self.initial_db_mock = []
                for i in test[KEY_INPUT]:
                    self.initial_db_mock.append(i)

                actual_result = print_players()
                expected_result = test[KEY_EXPECTED]

                self.assertIsNot(actual_result, expected_result)
                self.assertNotEqual(actual_result, expected_result)


if __name__ == '__main__':
    unittest.main()
