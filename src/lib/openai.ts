import axios from 'axios';

const openai = {
  createChatCompletions: async (openaiKey: string, requestBody: any) => {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        ...requestBody,
      },
      {
        headers: {
          Authorization: `Bearer ${openaiKey}`,
        },
      }
    );
    return response.data;
  },
};

export default openai;
