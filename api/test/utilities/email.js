import { expect } from 'chai';

import {
	SendPasswordResetEmail,
	SendWelcomeEmail,
	DummyEmailTransport,
} from '../../src/utils/email/send';

describe('Email sending', () => {
	it('should send password reset email', async () => {
		const data = {
			email: 'invalid@email.com',
			passcode: '7f6dc5d9-9084-4571-8578-4da2427388c6',
		};

		let e = await SendPasswordResetEmail(data);
		let email = DummyEmailTransport.emails[0];

		expect(email.subject).to.equal('Forgot Password');
		expect(email.to).to.equal('invalid@email.com');
	});

	it('should send welcome email', async () => {
		await SendWelcomeEmail({
			email: 'invalid@email.com',
		});

		let email = DummyEmailTransport.emails[0];

		expect(email.subject).to.equal('Welcome to Winds!');
		expect(email.to).to.equal('invalid@email.com');
	});
});
