const twilio = require('twilio');

class ChallengeManager {
  constructor() {
    this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    this.challenges = new Map();
  }

  async create(user, fields) {
    console.log('identity: ', user.id);

    const challenge = await this.client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .entities(user.id)
      .challenges.create({
        'details.message': 'Please approve the login request',
        'details.fields': fields,
        factorSid: user.factor.sid
      });

    this.challenges.set(challenge.sid, {
      status: challenge.status,
      socket: undefined
    });

    return challenge;
  }

  async fetch(user, sid) {
    const challenge = await this.client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .entities(user.id)
      .challenges(sid)
      .fetch();
    this.challenges.set(challenge.sid, {
      status: challenge.status,
      socket: undefined
    });
  
    return challenge;
  }

  get(sid) {
    return this.challenges.get(sid);
  }

  update(sid, status) {
    const { socket } = this.challenges.get(sid);

    this.challenges.set(sid, { socket, status });

    socket && socket.send(JSON.stringify({ status: status }));
  }

  registerSocket(sid, socket) {
    const { status } = this.challenges.get(sid);

    this.challenges.set(sid, { status, socket });
  }
}

module.exports = ChallengeManager;
