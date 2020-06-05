import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react'
import './styles.css'
import logo from '../../assets/logo.svg'
import {FiArrowLeft, FiCheckCircle} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Map, TileLayer, Marker } from 'react-leaflet'
import api from '../../services/api'
import axios from 'axios'
import {LeafletMouseEvent} from 'leaflet'


interface Item {
  id: number;
  title: string;
  image_url: string;
  name: string
}


interface IBGEufResponse {
  sigla:string;
}
interface IBGECityResponse {
  nome:string;
}

const CreatePoint = () => {

  const [formData , setFormData ] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })

 

  const [items, setItems] = useState<Item[]>([])

  const [city, setCity] = useState<string[]>([])

  const [ufs, setUfs] = useState<string[]>([])

  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])

  const [selectedUf, setSelectedUf] = useState('0')

  const [selectedCity, setSelectedCity] = useState('0')

  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0 , 0])

  const [selectItems, setSelectedItems] = useState<number[]>([])

  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords
      setInitialPosition([latitude, longitude])
    })

  }, [])

  useEffect(()=>{
    api.get('/items').then(response => {
      setItems(response.data)
    })
  }, [])

  useEffect(() => {
    axios.get<IBGEufResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados/').then(response => {
      const ufInitials = response.data.map(uf => uf.sigla)

      setUfs(ufInitials)
    })
  })

  useEffect(() => {
    if (selectedUf === '0'){
      return;
    }
    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
      const cityNames = response.data.map(city => city.nome)

      setCity(cityNames)
    })
  }, [selectedUf])

  function handleSelectUf (event: ChangeEvent<HTMLSelectElement>) {
   const uf =event.target.value

   setSelectedUf(uf)
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
    const city = event.target.value

    setSelectedCity(city)
  }

  function handleMapClick(event: LeafletMouseEvent ){
    setSelectedPosition(
      [event.latlng.lat,
         event.latlng.lng
        ])
  }

  function handleInputchange(event:ChangeEvent<HTMLInputElement>){
    const {name, value} = event.target
    
    setFormData({
      ...formData,
      [name]: value
    })
  }

  function handleSelectItem(id:number){
    const alreadySelected = selectItems.findIndex(item => item === id)
    
    if(alreadySelected>= 0){
      const filteredItems = selectItems.filter(item => item !== id) 
      setSelectedItems(filteredItems)
    }else{
    setSelectedItems([...selectItems, id] )
  }
}

 async function handleSubmit(event: FormEvent){
    event.preventDefault();

    const { name, email, whatsapp} = formData
    const uf = selectedUf
    const city = selectedCity
    const [latitude, longitude] = selectedPosition
    const items = selectItems

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items
    }

    await api.post('points',data);

    alert('Ponto de coleta criado')

    setShowCompleted(true)

  }


  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="ecoleta"/>
        <Link to="/">
        <FiArrowLeft/>
        Voltar para home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br/>ponto de coleta.</h1>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
             type="text"
             name ='name'
             id = 'name'
             onChange={handleInputchange}
             />
          </div>
          <div className="field-group">
          <div className="field">
            <label htmlFor="name">E-mail</label>
            <input
             type="email"
             name ='email'
             id = 'email'
             onChange={handleInputchange}
             />
          </div>
          <div className="field">
            <label htmlFor="name">Whatsapp</label>
            <input
             type="text"
             name ='whatsapp'
             id = 'whatsapp'
             onChange={handleInputchange}
             />
          </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

            <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
              />
              <Marker position={selectedPosition} />
            </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">UF</label>
              <select
               name="uf"
               id="uf"
               value={selectedUf}
               onChange={handleSelectUf}>
                <option value="0" >Selecione um UF</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
               name="city"
                id="city"
                value={selectedCity}
                onChange={handleSelectCity}
                >
                <option value="0">Selecione uma cidade</option>
                {city.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um  ou mais ítens abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map(item => (
                <li 
                key={item.id} 
                onClick={() => {handleSelectItem(item.id)}}
                className={selectItems.includes(item.id) ? 'selected': ''}
                >
                  <img src={item.image_url} alt={item.title}/>
                  <span>{item.title}</span>
                </li> 
            ))}  
          </ul>
        </fieldset>
        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
      { showCompleted && (
        <div className="completed">
          <Link to='/'>
            <FiCheckCircle/>
          </Link>
          <h1>Cadastro concluído com sucesso!</h1>
        </div>
      )}
    </div>
  )
}
export default CreatePoint