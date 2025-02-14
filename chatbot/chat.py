# import aiml
# import os

# class ChatBot:
#     def __init__(self):
#         self.kernel = aiml.Kernel()
#         aiml_path = os.path.join(os.path.dirname(__file__), "bot.aiml")
#         self.kernel.learn(aiml_path)

#     def get_response(self, message):
#         return self.kernel.respond(message.upper())  # Convert input to uppercase for matching

# chatbot = ChatBot()


#told me wat the issue is
# import aiml
# import os

# class ChatBot:
#     def __init__(self):
#         self.kernel = aiml.Kernel()
#         aiml_path = os.path.join(os.path.dirname(__file__), "chatbot", "bot.aiml")
#         self.kernel.learn(aiml_path)
#         print(f"Looking for AIML file at: {aiml_path}")
        
#     def get_response(self, message):
#         return self.kernel.respond(message.upper())

# # Create an instance that can be imported
# chatbot = ChatBot()
# print(chatbot.get_response("HELLO"))
# print(chatbot.get_response("WHAT IS YOUR NAME"))




# import aiml
# import os


# class ChatBot:
#     def __init__(self):
#         self.kernel = aiml.Kernel()
#         # Remove the duplicate 'chatbot' in the path
#         aiml_path = os.path.join(os.path.dirname(__file__), "bot.aiml")
#         print(f"Looking for AIML file at: {aiml_path}")
#         if not os.path.exists(aiml_path):
#             print(f"Warning: AIML file not found at {aiml_path}")
#         self.kernel.learn(aiml_path)

#     def get_response(self, message):
#         return self.kernel.respond(message.upper())

# chatbot = ChatBot()

# if __name__ == "__main__":
#     bot = ChatBot()
#     print(bot.get_response("HELLO"))
#     print(bot.get_response("WHAT IS YOUR NAME"))


import aiml
import os

class ChatBot:
    def __init__(self):
        self.kernel = aiml.Kernel()
        aiml_path = os.path.join(os.path.dirname(__file__), "bot.aiml")
        print(f"Looking for AIML file at: {aiml_path}")
        if not os.path.exists(aiml_path):
            print(f"Warning: AIML file not found at {aiml_path}")
        self.kernel.learn(aiml_path)

    def get_response(self, message):
        return self.kernel.respond(message.upper())

# Create a single instance to be imported
chatbot = ChatBot()
    


