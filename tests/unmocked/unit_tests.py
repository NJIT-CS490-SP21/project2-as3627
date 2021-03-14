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
            


if __name__ == '__main__':
    unittest.main()