const context = require('../context');

const update = (request, response) => {
  console.log(
    `Verify Push Webhook ${request.body.service_sid} factor ${request.body.factor_sid} type ${request.body.type}`
  );

  const { challenge_sid: channelSid, type } = request.body;

  if (channelSid) {
    context.challenges.update(channelSid, type.replace('challenge.', ''));
  }

  response.status(200).end();
};

const status = async (request, response) => {
  const challenge = await context.challenges.fetch(request.session.user, request.session.challenge.sid);
  response.json({ status: challenge.status });
}

module.exports = { update, status };
