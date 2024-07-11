import { IEvents } from './base/events';
import { Form } from './common/Form'
import { ensureElement } from '../utils/utils';
import { IOrder } from '../types';

export class ContactsForm extends Form<IOrder> {
	protected _email: HTMLInputElement;
	protected _phone: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._email = container.elements.namedItem('email') as HTMLInputElement
		this._phone = container.elements.namedItem('phone') as HTMLInputElement
	}

	set phone(value: string) {
		this._phone.value = value;
	}

	set email(value: string) {
		this._email.value = value;
	}
}