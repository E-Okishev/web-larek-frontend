import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { API_URL, CDN_URL } from './utils/constants';
import { LarekApi } from './components/LarekAPI';
import { IOrder, IProduct, TOrder } from './types';
import { Product } from './components/Product';
import { cloneTemplate, ensureElement } from './utils/utils';
import { AppState } from './components/AppState';
import { Modal } from './components/common/Modal';
import { Basket } from './components/Basket';
import { OrderForm } from './components/OrderForm';
import { ContactsForm } from './components/ContactsForm';
import { Success } from './components/Success';
import { Page } from './components/Page';

const events = new EventEmitter();

const cardCatalog = ensureElement<HTMLTemplateElement>('#card-catalog');
const modalPreview = ensureElement<HTMLTemplateElement>('#card-preview');
const productInBasket = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const api = new LarekApi(CDN_URL, API_URL);
const appState = new AppState({}, events);

api.getProducts()
	.then(res => {
		appState.products = res;
		events.emit('products:loaded', res);
	})
	.catch(err => console.error(err));

events.on('products:loaded', () => {
	page.catalog = appState.products.map(product => {
		const productCard = new Product('card', cloneTemplate(cardCatalog), {
			onClick: () => events.emit('card:select', product)
		});

		return productCard.render({
			image: product.image,
			title: product.title,
			category: product.category,
			price: product.price,
		});
	});
});

events.on('modal:open', () => { page.locked = true; });
events.on('modal:close', () => { page.locked = false; });

events.on('card:select', (item: IProduct) => {
	const selectedCard = appState.getProduct(item.id);
	const preview = new Product('card', cloneTemplate(modalPreview), {
		onClick: () => {
			if (appState.basket.includes(item)) {
				preview.setText(preview.button, 'В корзину');
				events.emit('card:deletefromcart', item);
			} else {
				events.emit('card:addtocart', item);
				preview.setText(preview.button, 'Удалить из корзины');
			}
		}
	});

	if (selectedCard.price === null) {
		preview.setDisabled(preview.button, true);
	}

	preview.setText(preview.button, appState.basket.includes(item) ? 'Удалить из корзины' : 'В корзину');

	modal.render({
		content: preview.render({
			image: item.image,
			title: item.title,
			category: item.category,
			price: item.price,
			description: item.description
		})
	});
});

events.on('card:addtocart', (item: IProduct) => {
	appState.toBasket(item);
	page.counter = appState.basket.length;
});

const basketView = new Basket(cloneTemplate(basketTemplate), events);

events.on('basket:open', () => {
	const products = appState.basket.map((item, index) => {
		const product = new Product('card', cloneTemplate(productInBasket), {
			onClick: () => {
				events.emit('card:deletefromcart', item);
				events.emit('basket:open');
			}
		});

		return product.render({
			price: item.price,
			title: item.title,
			id: item.id,
			index: index + 1
		});
	});

	modal.render({
		content: basketView.render({
			products,
			total: appState.setTotal(),
			selected: products.length
		})
	});
});

events.on('card:deletefromcart', (item: IProduct) => {
	appState.deleteFromBasket(item);
	page.counter = appState.basket.length;
});

const orderView = new OrderForm(cloneTemplate(orderTemplate), events);
const contactsView = new ContactsForm(cloneTemplate(contactsTemplate), events);

events.on('order:open', () => {
	appState.order.total = appState.setTotal();
	appState.order.items = appState.basket.map(item => item.id);
	modal.render({
		content: orderView.render({
			valid: false,
			errors: []
		})
	});
});

const updateOrderAndContacts = (data: { field: keyof TOrder, value: string }) => {
	appState.setOrderField(data.field, data.value);
};

events.on(/^order\..*:change/, updateOrderAndContacts);
events.on(/^contacts\..*:change/, updateOrderAndContacts);

events.on('payment:choosed', (data: { payment: string }) => {
	appState.setOrderField('payment', data.payment);
});

events.on('formErrors:change', (errors: Partial<IOrder>) => {
	const { payment, address } = errors;

	orderView.valid = !payment && !address;
	orderView.errors = Object.values({ address, payment }).filter(Boolean).join('; ');

	const { phone, email } = errors;

	contactsView.valid = !phone && !email;
	contactsView.errors = Object.values({ phone, email }).filter(Boolean).join('; ');
});

events.on('order:submit', () => {
	modal.render({
		content: contactsView.render({
			valid: false,
			errors: []
		})
	});
});

events.on('contacts:submit', () => {
	api.orderProducts(appState.order)
		.then(() => {
			appState.clearBasket();
			appState.order = {
				payment: "",
				email: "",
				phone: "",
				address: "",
				items: [],
				total: appState.order.total
			};
			page.counter = appState.basket.length;

			const successView = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
					appState.order.total = 0;
				}
			});

			modal.render({
				content: successView.render({
					total: appState.order.total
				})
			});
		})
		.catch(err => console.error(err));
});

events.onAll(event => {
	console.log(event.eventName, event.data);
});