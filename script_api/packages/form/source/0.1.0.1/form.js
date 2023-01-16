
import { 
	MessageFormData
	ActionFormData,
	ModalFormData
} from "@minecraft/server-ui"

const FORMS = { 
	MessageFormData
	ActionFormData,
	ModalFormData
}


class FormOption {
	static VERSION = "0.1.0.1"
	
	constructor ({ force, timeout }) {
		this.force = Boolean( force )
		this.timeout = this.parseInt( timeout )
	}
	
	parseInt ( value ) {
		return parseInt( value ) || 0
	}
}


export class Form {
	static VERSION = "0.1.0.1"
	
	#form = null
	
	constructor (title, body, options) {
		this.title = title
		this.body = body
		
		this.#hasFields = false
	}
	
	#initHandlers () {
		this.handlers = []
	}
	
	#validateForm (value) {
		if (value == null) {
			throw new ReferenceError( value + " does not exist" )
		}
	}
	
	type ( value ) {
		const form = FORMS[ String(value) ]
		
		this.#validateForm( form )
		
		this.#form = new form()
		this.#initHandlers()
		
		return this
	}
	
	#setFormTypeFromFieldName (field) {
		for (let form in FORMS) {
			if ( field in FORMS[form].prototype ) {
				return this.type( form )
			}
		}
	}
	
	#validateField (value) {
		this.#validateForm( this.#form )
		
		if (value in this.#form) {
			throw new ReferenceError( value + " does not exist in " + this.#form.constructor.name )
		}
	}
	
	field (name, ...args) {
		try { 
			this.#validateForm( this.#form )
		} catch {
			this.#setFormTypeFromFieldName( name )
		}
		
		this.#validateField( name )
		
		this.#form[ name ]( ...args )
		
		this.handlers.push(null)
		
		this.#hasFields = true
		
		return this
	}
	
	first () {
		this.field( "button1", ...arguments )
		
		return this
	}
	second () {
		this.field( "button2", ...arguments )
		
		return this
	}
	
	button () {
		this.field( "button", ...arguments )
		
		return this
	}
	
	text () {
		this.field( "textField", ...arguments )
		
		return this
	}
	dropdown () {
		this.field( "dropdown", ...arguments )
		
		return this
	}
	slider () {
		this.field( "slider", ...arguments )
		
		return this
	}
	toggle () {
		this.field( "toggle", ...arguments )
		
		return this
	}
	
	#validateFields () {
		if (this.#hasFields == false) {
			throw RangeError( "no field found" )
		}
	}
	
	#validateFunction (value) {
		if (typeof value !== "function") {
			throw value + " not a function"
		}
	}
	
	addHandler ( value ) {
		this.#validateFields()
		this.#validateFunction(value)
		
		const length = this.handlers.length
		
		this.handlers[ length - 1 ] = value
		
		return this
	}
	
	#validatePlayer (value) {
		if (value == null) {
			throw TypeError( value + " is not Player" )
		}
	}
	
	#callHandler () {
		
	}
	
	#handleResponse (response) {
		const {
			selection,
			formValues
		} = response
		
		const values = selection ? [selection] : formValues
		
		values.forEach( (value, index) => {
			const data = {
				player, response, value
			}
			
			this.#handlers[ index ]?.( data )
		} )
		
	}
	
	show (player, options) {
		this.#validateFields()
		this.#validatePlayer( player )
		
		const formOption new FormOption( options )
		
		const handleResponse = v => this.#handleResponse( v )
		
		return new Promise( async resolve => {
			const response = await player.show( player )
			
			const { 
				canceled,
				cancelationReason
			} = response
			
			handleResponse( response )
			
			resolve( response )
		} )
	}
	
}