const shopifyClient = {
	domain: 'store.playsuperlative.com',
	storefrontAccessToken: '0aae201fb5293caf169cad1efb8b5134',
};

function createBuyButtons(client) {
	const buyComponents = document.querySelectorAll('.buy_component');

	buyComponents.forEach(component => {
		const productId = component.dataset.productId;
		const buttonText = component.dataset.buttonText || 'Add to cart';
		const showPrice = component.dataset.showPrice || false;

		ShopifyBuy.UI.onReady(client).then(ui => {
			ui.createComponent('product', {
				id: productId, // 7820576653375
				node: component,
				moneyFormat: '%24%7B%7Bamount%7D%7D',
				options: {
					product: {
						iframe: false,
						contents: {
							img: false,
							imgWithCarousel: false,
							title: false,
							price: showPrice,
							variantTitle: false,
							quantity: false,
							description: false,
							buttonWithQuantity: false,
							button: true,
						},
						text: {
							button: buttonText,
						},
					},
					cart: {
						startOpen: false,
						iframe: false,
						popup: false,
						text: {
							total: "Subtotal",
							button: "Checkout"
						},
					},
					toggle: {
						iframe: false,
					}

				}
			});
		});
	});
}

function shopifyInit() {
	const client = ShopifyBuy.buildClient(shopifyClient);

	createBuyButtons(client);
}

document.addEventListener('DOMContentLoaded', shopifyInit);
