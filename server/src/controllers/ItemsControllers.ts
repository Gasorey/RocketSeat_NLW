import {Request, Response} from 'express'

import knex from '../database/connection'

class ItemsControllers {
  async index(request: Request, response: Response) {
    const items = await knex('items').select('*');

    const serializaedItems = items.map(item => {
      return {
        id: item.id,
        title: item.title,
        image_url: `http://192.168.15.27:3333/uploads/${item.image}`,
      };
    });

    response.json(serializaedItems);
  }
  }

  export default ItemsControllers
