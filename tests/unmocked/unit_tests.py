import unittest

KEY_INPUT = "input"
KEY_EXPECTED = "expected"
KEY_LENGTH = "length"
KEY_FIRST_WORD = "first_word"
KEY_SECOND_WORD = "second_word"


class FormatListTestCase(unittest.TestCase):
    def setUp(self):
        self.success_test_params = [
            {
                KEY_INPUT: ["('PlayerA',)"],
                KEY_EXPECTED: ["PlayerA"],
            },
            
            {
                KEY_INPUT: ["('1',)"],
                KEY_EXPECTED: ["1"],
            },
            
            {
                KEY_INPUT: ["('PlayerA',)", "('1',)"],
                KEY_EXPECTED: ["PlayerA", "1"],
            },
        ]
        
        self.failure_test_params = [
            {
                KEY_INPUT: ["('2',)"],
                KEY_EXPECTED: ["('2',)", ""],
            },
            
             {
                KEY_INPUT: ["'(PlayerB',)"],
                KEY_EXPECTED: ["'PlayerA'","(,)"],
            },
            
            {
                KEY_INPUT: ["('PlayerB',)", "('2',)"],
                KEY_EXPECTED: ["PlayerB 2"],
            },
        ]


    def test_format_list_success(self):
        for test in self.success_test_params:
            actual_result = format_list(test[KEY_INPUT])
            
            expected_result = test[KEY_EXPECTED]
            
            self.assertEqual(len(actual_result), len(expected_result))
            self.assertEqual(actual_result, expected_result)
            
    def test_format_list_failure(self):
        for test in self.failure_test_params:
            actual_result = format_list(test[KEY_INPUT])
            
            expected_result = test[KEY_EXPECTED]
            
            self.assertNotEqual(len(actual_result), len(expected_result))
            self.assertNotEqual(actual_result, expected_result)


# I took the same format_list function from app.py
def format_list(old):
    new_list = []
    for value in enumerate(old):
        temp = value[1]
        temp = temp.replace("(", "")
        temp = temp.replace(")", "")
        temp = temp.replace("'", "")
        temp = temp.replace(",", "")
        new_list.append(temp)

    return new_list



class LoginTestCase(unittest.TestCase):
    def setUp(self):
        self.success_test_params = [
            {
                KEY_INPUT: ["Player_A"],
                KEY_EXPECTED: [["Player_A"],[]],
            },

            {
                KEY_INPUT: ["Player_A", "Player_B"],
                KEY_EXPECTED: [["Player_A", "Player_B"], []],
            },

            {
                KEY_INPUT: ["Player_A", "Player_B", "Spectator_1", "Spectator_2"],
                KEY_EXPECTED: [["Player_A", "Player_B"], ["Spectator_1", "Spectator_2"]],
            },

            {
                KEY_INPUT: ["Player_A", "Player_A", "Player_A"],
                KEY_EXPECTED: [["Player_A"],[]],
            },
        ]
        
        self.failure_test_params = [
            {
                KEY_INPUT: ["Player_A", "Player_B"],
                KEY_EXPECTED: [["Player_A"],["Player_B"]],
            },
            {
                KEY_INPUT: ["Player_A", "Player_B", "Player_C"],
                KEY_EXPECTED: [["Player_A", "Player_B", "Player_C"], []],
            },
            {
                KEY_INPUT: ["Spectator_1", "Spectator_2", "Spectator_3"],
                KEY_EXPECTED: [[], ["Spectator_1", "Spectator_2", "Spectator_3"]],
            },
            {
                KEY_INPUT: ["Spectator_1", "Spectator_1", "Spectator_1"],
                KEY_EXPECTED: [["Spectator_1", "Spectator_1"], ["Spectator_1"]],
            },
            
        ]


    def test_login_success(self):
        global PLAYERS, SPECTATORS
        for test in self.success_test_params:
            for i in test[KEY_INPUT]:
                on_login(i)
            
            expected_result = test[KEY_EXPECTED]
            self.assertEqual(len(PLAYERS), len(expected_result[0]))
            self.assertEqual(PLAYERS, expected_result[0])
            self.assertEqual(len(SPECTATORS), len(expected_result[1]))
            self.assertEqual(SPECTATORS, expected_result[1])
            PLAYERS = []
            SPECTATORS = []
            
    def test_login_failure(self):
        global PLAYERS, SPECTATORS
        for test in self.failure_test_params:
            for i in test[KEY_INPUT]:
                on_login(i)
            
            expected_result = test[KEY_EXPECTED]
            self.assertNotEqual(len(PLAYERS), len(expected_result[0]))
            self.assertNotEqual(PLAYERS, expected_result[0])
            self.assertNotEqual(len(SPECTATORS), len(expected_result[1]))
            self.assertNotEqual(SPECTATORS, expected_result[1])
            PLAYERS = []
            SPECTATORS = []


PLAYERS = []
SPECTATORS = []

# I rewrote the login function so it doesn't involve DB or SocketIO
def on_login(name):
    '''When a client logs in'''
    if name in PLAYERS:
        return
    elif name in SPECTATORS:
        return
    else:

        if len(PLAYERS) < 2:
            PLAYERS.append(name)
        else:
            SPECTATORS.append(name)


if __name__ == '__main__':
    unittest.main()