import React, { useEffect, useState, useRef } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { Link, useParams } from 'react-router-dom'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from '../components/Loading'
import CardProduct from '../components/CardProduct'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

const ProductListPage = () => {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [totalPage, setTotalPage] = useState(1)
  const [subCategoriesLocal, setSubCategoriesLocal] = useState([])
  const params = useParams()
  const AllSubCategory = useSelector(state => state.product.allSubCategory)
  const allCategory = useSelector(state => state.product.allCategory)
  const [DisplaySubCatory, setDisplaySubCategory] = useState([])
  const [subCategoryName, setSubCategoryName] = useState("")
  const [categoryName, setCategoryName] = useState("")
  const containerRef = useRef()

  console.log(AllSubCategory)

  const categoryId = params?.category?.split("-")?.slice(-1)[0] || ""
  const subCategoryId = params?.subCategory?.split("-")?.slice(-1)[0] || ""

  // Fetch subcategories from API if not in Redux
  const fetchSubCategoriesFromAPI = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getSubCategory
      })
      
      if (response.data && response.data.success) {
        console.log('Fetched SubCategories from API:', response.data.data)
        setSubCategoriesLocal(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    }
  }


  const fetchProductdata = async () => {
    try {
      console.log('Fetch products for', { categoryId, subCategoryId, page })
      setLoading(true)

      let response
      if (categoryId && subCategoryId) {
        response = await Axios({
          ...SummaryApi.getProductByCategoryAndSubCategory,
          data: {
            categoryId: [categoryId],
            subCategoryId: [subCategoryId],
            page: page,
            limit: 8,
          }
        })
      } else if (categoryId) {
        response = await Axios({
          ...SummaryApi.getProductByCategory,
          data: {
            id: [categoryId]
          }
        })
      } else {
        // nothing to fetch
        setData([])
        setTotalPage(0)
        console.log("Nothing is fetching");
        return
      }

      const { data: responseData } = response
      console.log('Product fetch response:', responseData)

      if (responseData && responseData.success) {
        const incoming = responseData.data || []
        if (page === 1) {
          setData(incoming)
        } else {
          setData(prev => [...prev, ...incoming])
        }
        setTotalPage(responseData.totalCount || 0)
      } else {
        console.warn('No products returned or success=false', responseData)
        setData([])
        setTotalPage(0)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  // reset page to 1 when route params change
  useEffect(() => {
    setPage(1)
  }, [params])

  // fetch products whenever params or page change
  useEffect(() => {
    fetchProductdata()
  }, [params, page])


  useEffect(() => {
    // Fetch subcategories if not already in Redux
    if (!AllSubCategory || AllSubCategory.length === 0) {
      console.log('Fetching subcategories because Redux is empty')
      fetchSubCategoriesFromAPI()
    }
  }, [])

  useEffect(() => {
    console.log('=== ProductListPage Debug ===')
    console.log('URL params:', { categoryId, subCategoryId })
    console.log('AllSubCategory from Redux:', AllSubCategory)
    console.log('SubCategories from Local State:', subCategoriesLocal)
    console.log('allCategory:', allCategory)

    // Use Redux data if available, otherwise use local fetched data
    const subCategoriesToUse = AllSubCategory && AllSubCategory.length > 0 ? AllSubCategory : subCategoriesLocal

    const sub = (subCategoriesToUse || []).filter(s => {
      const cats = s?.category || []
      const filterData = cats.some(el => {
        const elId = el?._id ?? el
        return String(elId) === String(categoryId)
      })
      return filterData
    })

    console.log('Filtered SubCategories:', sub)
    setDisplaySubCategory(sub)

    // Set the actual subCategoryName from the state
    if (subCategoryId && sub.length > 0) {
      const currentSubCategory = sub.find(s => s._id === subCategoryId)
      if (currentSubCategory) {
        console.log('Setting subCategoryName:', currentSubCategory.name)
        setSubCategoryName(currentSubCategory.name)
      } else {
        console.log('SubCategory not found, setting to first one')
        setSubCategoryName(sub[0]?.name || "")
      }
    } else if (sub.length > 0) {
      console.log('Setting subCategoryName to first item:', sub[0]?.name)
      setSubCategoryName(sub[0]?.name || "")
    }

    // Get category name
    if (categoryId && allCategory) {
      const currentCategory = allCategory.find(c => c._id === categoryId)
      if (currentCategory) {
        console.log('Setting categoryName:', currentCategory.name)
        setCategoryName(currentCategory.name)
      }
    }
  }, [params, AllSubCategory, subCategoriesLocal, allCategory, categoryId, subCategoryId])
  
  console.log('=== Final State Values ===')
  console.log('subCategoryName:', subCategoryName)
  console.log('categoryName:', categoryName)
  console.log('DisplaySubCatory length:', DisplaySubCatory.length)
  console.log('data length:', data.length)
  return (
    <section className='relative'>
      <div className='container mx-auto grid grid-cols-[80px,1fr] md:grid-cols-[160px,1fr] lg:grid-cols-[250px,1fr] mt-0'>
        {/**sub category **/}
        <div className='min-h-[88vh] max-h-[88vh] overflow-y-scroll grid gap-0 shadow-md scrollbarCustom bg-red-500 py-1 relative z-0'>
          {DisplaySubCatory.length === 0 && (
            <div className='p-2 text-white text-center text-xs'>
              <p className='break-words'>No subcategories</p>
            </div>
          )}
          {
            DisplaySubCatory.map((s, index) => {
               const link = `/${valideURLConvert(s?.category[0]?.name)}-${s?.category[0]?._id}/${valideURLConvert(s.name)}-${s._id}`
              return (
                <Link to={link} className={`w-full p-1 flex flex-col items-center justify-center lg:flex-row lg:items-center lg:w-full lg:h-14 box-border lg:gap-2 border-b 
                  hover:bg-green-100 cursor-pointer transition-colors pointer-events-auto relative z-10
                  ${subCategoryId === s._id ? "bg-green-100" : ""}
                `}
                key={s._id + "subcategory"}
                >
                  <div className='w-12 h-12 lg:w-10 lg:h-10 mx-auto lg:mx-0 bg-white rounded box-border flex-shrink-0 flex items-center justify-center' >
                    <img
                      src={s.image}
                      alt={s.name}
                      className='w-10 h-10 lg:w-8 lg:h-8 object-scale-down'
                    />
                  </div>
                  <p className='text-xs text-center lg:text-left break-words line-clamp-2 flex-1'>{s.name}</p>
                </Link>
              )
            })
          }
        </div>


        {/**Product **/}
        <div className='sticky top-20 z-0'>
          <div className='bg-blue-500 shadow-md p-3 z-10'>
            <h3 className='font-semibold text-white text-base truncate'>{subCategoryName || "Products"}</h3>
          </div>
          <div>
           <div className='min-h-[80vh] max-h-[80vh] overflow-y-auto relative bg-gray-50'>
            {data.length === 0 && !loading && (
              <div className='flex items-center justify-center h-full p-4'>
                <p className='text-gray-500'>No products available</p>
              </div>
            )}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-3 gap-3'>
                {
                  data.map((p, index) => {
                    return (
                      <CardProduct
                        data={p}
                        key={p._id + "productSubCategory" + index}
                      />
                    )
                  })
                }
              </div>
           </div>

            {
              loading && (
                <Loading />
              )
            }

          </div>
        </div>
      </div>
    </section>
  )
}


export default ProductListPage