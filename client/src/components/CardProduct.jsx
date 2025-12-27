import React from 'react'
import { DisplayPriceInRupees } from '../utils/DisplayPricelnRupees'
import { Link } from 'react-router-dom'
import { valideURLConvert } from '../utils/valideURLConvert'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import AddToCartButton from './AddToCartButton'

const CardProduct = ({data}) => {
    const url = `/product/${valideURLConvert(data.name)}-${data._id}`
    const [loading,setLoading] = useState(false)
  
  return (
    <div className='border py-2 lg:p-4 grid gap-1 lg:gap-3 min-w-36 lg:min-w-52 rounded cursor-pointer bg-white' >
      <Link to={url} className='min-h-20 w-full max-h-24 lg:max-h-32 rounded overflow-hidden'>
            <img 
                src={data.image[0]}
                className='w-full h-full object-scale-down lg:scale-125'
            />
      </Link>
      <div className='flex items-center gap-1'>
        <div className='rounded text-xs w-fit p-[1px] px-2 text-green-600 bg-green-50'>
              10 min 
        </div>
        <div>
            {
              Boolean(data.discount) && (
                <p className='text-green-600 bg-green-100 px-2 w-fit text-xs rounded-full'>{data.discount}% discount</p>
              )
            }
        </div>
      </div>
      <Link to={url} className='px-2 lg:px-0 font-medium text-ellipsis text-sm lg:text-base line-clamp-2'>
        {data.name}
      </Link>
      <Link to={url} className='w-fit gap-1 px-2 lg:px-0 text-sm lg:text-base'>
        {data.unit} 
        
      </Link>

      <div className='px-2 lg:px-0 flex items-center justify-between gap-1 lg:gap-3 text-sm lg:text-base'>
        <Link to={url} className='flex items-center gap-1'>
          <div className='font-semibold'>
              {DisplayPriceInRupees(pricewithDiscount(data.price,data.discount))} 
          </div>
          
          
        </Link>
        <div className=''>
          {
            data.stock == 0 ? (
              <p className='text-red-500 text-sm text-center'>Out of stock</p>
            ) : (
              <AddToCartButton data={data} />
            )
          }
            
        </div>
      </div>

    </div>
  )
}

export default CardProduct