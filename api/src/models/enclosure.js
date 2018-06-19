import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';
import autopopulate from 'mongoose-autopopulate';
import Cache from './cache';
import { createHash } from 'crypto';

export const EnclosureSchema = new Schema({
	url: {
		type: String,
		trim: true,
	},
	type: {
		type: String,
		trim: true,
	},
	length: {
		type: String,
		trim: true,
	},
});
