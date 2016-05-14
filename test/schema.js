var sql = require('sql');


exports.actor = sql.define({
	name: 'actor',
	columns: [
		{ name: 'actor_id' },
		{ name: 'first_name' },
		{ name: 'last_name' },
		{ name: 'last_update' }
	]
});


exports.actor_info = sql.define({
	name: 'actor_info',
	columns: [
		{ name: 'actor_id' },
		{ name: 'first_name' },
		{ name: 'last_name' },
		{ name: 'film_info' }
	]
});


exports.address = sql.define({
	name: 'address',
	columns: [
		{ name: 'address_id' },
		{ name: 'address' },
		{ name: 'address2' },
		{ name: 'district' },
		{ name: 'city_id' },
		{ name: 'postal_code' },
		{ name: 'phone' },
		{ name: 'last_update' }
	]
});


exports.category = sql.define({
	name: 'category',
	columns: [
		{ name: 'category_id' },
		{ name: 'name' },
		{ name: 'last_update' }
	]
});


exports.city = sql.define({
	name: 'city',
	columns: [
		{ name: 'city_id' },
		{ name: 'city' },
		{ name: 'country_id' },
		{ name: 'last_update' }
	]
});


exports.country = sql.define({
	name: 'country',
	columns: [
		{ name: 'country_id' },
		{ name: 'country' },
		{ name: 'last_update' }
	]
});


exports.customer = sql.define({
	name: 'customer',
	columns: [
		{ name: 'customer_id' },
		{ name: 'store_id' },
		{ name: 'first_name' },
		{ name: 'last_name' },
		{ name: 'email' },
		{ name: 'address_id' },
		{ name: 'active' },
		{ name: 'create_date' },
		{ name: 'last_update' }
	]
});


exports.customer_list = sql.define({
	name: 'customer_list',
	columns: [
		{ name: 'ID' },
		{ name: 'name' },
		{ name: 'address' },
		{ name: 'zip code' },
		{ name: 'phone' },
		{ name: 'city' },
		{ name: 'country' },
		{ name: 'notes' },
		{ name: 'SID' }
	]
});


exports.film = sql.define({
	name: 'film',
	columns: [
		{ name: 'film_id' },
		{ name: 'title' },
		{ name: 'description' },
		{ name: 'release_year' },
		{ name: 'language_id' },
		{ name: 'original_language_id' },
		{ name: 'rental_duration' },
		{ name: 'rental_rate' },
		{ name: 'length' },
		{ name: 'replacement_cost' },
		{ name: 'rating' },
		{ name: 'special_features' },
		{ name: 'last_update' }
	]
});


exports.film_actor = sql.define({
	name: 'film_actor',
	columns: [
		{ name: 'actor_id' },
		{ name: 'film_id' },
		{ name: 'last_update' }
	]
});


exports.film_category = sql.define({
	name: 'film_category',
	columns: [
		{ name: 'film_id' },
		{ name: 'category_id' },
		{ name: 'last_update' }
	]
});


exports.film_list = sql.define({
	name: 'film_list',
	columns: [
		{ name: 'FID' },
		{ name: 'title' },
		{ name: 'description' },
		{ name: 'category' },
		{ name: 'price' },
		{ name: 'length' },
		{ name: 'rating' },
		{ name: 'actors' }
	]
});


exports.film_text = sql.define({
	name: 'film_text',
	columns: [
		{ name: 'film_id' },
		{ name: 'title' },
		{ name: 'description' }
	]
});


exports.inventory = sql.define({
	name: 'inventory',
	columns: [
		{ name: 'inventory_id' },
		{ name: 'film_id' },
		{ name: 'store_id' },
		{ name: 'last_update' }
	]
});


exports.language = sql.define({
	name: 'language',
	columns: [
		{ name: 'language_id' },
		{ name: 'name' },
		{ name: 'last_update' }
	]
});


exports.nicer_but_slower_film_list = sql.define({
	name: 'nicer_but_slower_film_list',
	columns: [
		{ name: 'FID' },
		{ name: 'title' },
		{ name: 'description' },
		{ name: 'category' },
		{ name: 'price' },
		{ name: 'length' },
		{ name: 'rating' },
		{ name: 'actors' }
	]
});


exports.payment = sql.define({
	name: 'payment',
	columns: [
		{ name: 'payment_id' },
		{ name: 'customer_id' },
		{ name: 'staff_id' },
		{ name: 'rental_id' },
		{ name: 'amount' },
		{ name: 'payment_date' },
		{ name: 'last_update' }
	]
});


exports.rental = sql.define({
	name: 'rental',
	columns: [
		{ name: 'rental_id' },
		{ name: 'rental_date' },
		{ name: 'inventory_id' },
		{ name: 'customer_id' },
		{ name: 'return_date' },
		{ name: 'staff_id' },
		{ name: 'last_update' }
	]
});


exports.sales_by_film_category = sql.define({
	name: 'sales_by_film_category',
	columns: [
		{ name: 'category' },
		{ name: 'total_sales' }
	]
});


exports.sales_by_store = sql.define({
	name: 'sales_by_store',
	columns: [
		{ name: 'store' },
		{ name: 'manager' },
		{ name: 'total_sales' }
	]
});


exports.staff = sql.define({
	name: 'staff',
	columns: [
		{ name: 'staff_id' },
		{ name: 'first_name' },
		{ name: 'last_name' },
		{ name: 'address_id' },
		{ name: 'picture' },
		{ name: 'email' },
		{ name: 'store_id' },
		{ name: 'active' },
		{ name: 'username' },
		{ name: 'password' },
		{ name: 'last_update' }
	]
});


exports.staff_list = sql.define({
	name: 'staff_list',
	columns: [
		{ name: 'ID' },
		{ name: 'name' },
		{ name: 'address' },
		{ name: 'zip code' },
		{ name: 'phone' },
		{ name: 'city' },
		{ name: 'country' },
		{ name: 'SID' }
	]
});


exports.store = sql.define({
	name: 'store',
	columns: [
		{ name: 'store_id' },
		{ name: 'manager_staff_id' },
		{ name: 'address_id' },
		{ name: 'last_update' }
	]
});


