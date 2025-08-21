## SugarSugar Alexa Skill Setup

This guide will help you create your own Alexa Skill to get your latest blood glucose reading using the SugarSugar API.

### Steps to Create Your Alexa Skill

1. **Sign in to the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)**
2. Click **Create Skill** and give it a name (e.g., `SugarSugar`).
3. Choose **Custom** for the skill type and **Alexa-Hosted (Node.js)** or **Provision your own** for the backend (Lambda).
4. In the left menu, go to **Code** (or your Lambda function in AWS Console if using your own backend).
5. **Copy the contents of `index.js` from this folder** and **paste it into the code editor** for your Lambda function.
6. Save and deploy your code.
7. In the **Interaction Model**, add a simple launch phrase (e.g., "Open SugarSugar").
8. Test your skill in the Alexa Simulator or on your device.

### Notes

- The skill fetches your latest glucose reading from the public SugarSugar API endpoint: `https://sugarsugar.vercel.app/glucose`.
- You can customize the code in `index.js` to change the spoken responses or connect to your own API.

---

For more details, see the official [Alexa Skills Kit documentation](https://developer.amazon.com/en-US/docs/alexa/ask-overviews/what-is-the-alexa-skills-kit.html).
