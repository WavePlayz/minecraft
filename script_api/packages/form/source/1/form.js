
import { 
	MessageFormData,
	ActionFormData,
	ModalFormData
} from "@minecraft/server-ui"

const FORMS = { 
	MessageFormData,
	ActionFormData,
	ModalFormData
}


class FormOption {
	static VERSION = "1.0.0.0"
	
	constructor ({ force, timeout } = {}) {
		this.force = Boolean( force )
		this.timeout = this.parseInt( timeout )
	}
	
	parseInt ( value ) {
		return parseInt( value ) || 0
	}
}


export class Form {
	static VERSION = "1.0.0.0"
	
	#form = null
	#handlers = []
	#hasFields = false
	#isFirstFirst = false
	
	constructor (title, body, options) {
		this.title = title
		this.body = body
	}
	
	#initHandlers () {
		this.#handlers = []
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
		
		if (!(value in this.#form)) {
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
		
		this.#handlers.push(null)
		
		this.#hasFields = true
		
		return this
	}
	
	first () {
		if (this.#hasFields == false) {
			this.#isFirstFirst = true
		}
		
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
		
		const length = this.#handlers.length
		
		this.#handlers[ length - 1 ] = value
		
		return this
	}
	
	#validatePlayer (value) {
		if (value == null) {
			throw TypeError( value + " is not Player" )
		}
	}
	
	#handleResponse (response, player) {
		const {
			selection,
			formValues
		} = response
		
		let values = formValues
		
		if (selection != null) {
			values = []
			values[selection] = selection
		}
		
		values.forEach( (value, index) => {
			const data = {
				player, response, value
			}
			
			let indexInvert = Math.abs( index - 1 )
			
			this.#handlers[  this.#isFirstFirst ? indexInvert : index ]?.( data )
		} )
		
	}
	
	show (player, options) {
		this.#validateFields()
		this.#validatePlayer( player )
		
		const formOption = new FormOption( options )
		
		const showForm = () => this.#form.show(player)
		const handleResponse = v => this.#handleResponse( v, player )
		
		
		
		return new Promise( async resolve => {
			try{
			const response = await showForm()
			
			
			
			const { 
				canceled,
				cancelationReason
			} = response
			
			handleResponse( response )
			
			resolve( response )
			}catch(e) { console.warn( e, e.stack ) }
		} )
	}
	
}