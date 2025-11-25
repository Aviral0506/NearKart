import React, { useEffect, useState } from 'react'
import UploadCategoryModel from '../components/UploadCategoryModel'
import Loading from '../components/Loading'
import NoData from '../components/NoData'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import EditCategory from '../components/EditCategory'
import CofirmBox from '../components/ConfirmBox'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { useSelector } from 'react-redux'

const CategoryPage = () => {
    const [openUploadCategory,setOpenUploadCategory] = useState(false)
    const [loading,setLoading] = useState(false)
    const [categoryData,setCategoryData] = useState([])
    const [openEdit,setOpenEdit] = useState(false)
    const [editData,setEditData] = useState({
        name : "",
        image : "",
    })
    const [openConfimBoxDelete,setOpenConfirmBoxDelete] = useState(false)
    const [deleteCategory,setDeleteCategory] = useState({
        _id : ""
    })

    const handleAddCategoryClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log("Opening category modal");
        setOpenUploadCategory(true);
    }
    // const allCategory = useSelector(state => state.product.allCategory)


    // useEffect(()=>{
    //     setCategoryData(allCategory)
    // },[allCategory])
    
    const fetchCategory = async()=>{
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.getCategory
            })
            const { data : responseData } = response

            if(responseData.success){
                setCategoryData(responseData.data)
            }
        } catch (error) {
            
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        fetchCategory()
    },[])
    console.log("categoryData",categoryData);
    const handleDeleteCategory = async()=>{
        try {
            const response = await Axios({
                ...SummaryApi.deleteCategory,
                data : deleteCategory
            })

            const { data : responseData } = response

            if(responseData.success){
                toast.success(responseData.message)
                fetchCategory()
                setOpenConfirmBoxDelete(false)
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }

  return (
    <section className=''>
        <div className='p-2 bg-white shadow-md flex items-center justify-between'>
            <h2 className='font-semibold'>Category</h2>
            <button 
                onClick={handleAddCategoryClick}
                type="button"
                style={{
                    pointerEvents: 'auto',
                    display: 'inline-block',
                    outline: 'none'
                }}
                className='text-sm border-2 border-primary-200 hover:bg-primary-200 hover:text-white px-4 py-2 rounded font-medium transition-all cursor-pointer bg-white text-primary-200 active:scale-95 lg:inline-block'
            >
                Add Category
            </button>
        </div>
        {
            !categoryData[0] && !loading && (
                <NoData/>
            )
        }

        <div className='p-4 grid  grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2'>
            {
                categoryData.map((category,index)=>{
                    return(
                        <div className='w-32 h-56 rounded shadow-md' key={category._id}>
                            <img 
                                alt={category.name}
                                src={category.image}
                                className='w-full object-scale-down'
                            />
                            <div className='items-center h-9 flex gap-2'>
                                <button onClick={()=>{
                                    setOpenEdit(true)
                                    setEditData(category)
                                }} className='flex-1 bg-green-100 hover:bg-green-200 text-green-600 font-medium py-1 rounded'>
                                    Edit
                                </button>
                                <button onClick={()=>{
                                    setOpenConfirmBoxDelete(true)
                                    setDeleteCategory(category)
                                }} className='flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-medium py-1 rounded'>
                                    Delete
                                </button>
                            </div>
                        </div>
                    )
                })
            }
        </div>

        {
            loading && (
                <Loading/>
            )
        }

        {
            openUploadCategory && (
                <UploadCategoryModel fetchData={fetchCategory} close={()=>setOpenUploadCategory(false)}/>
            )
        }

        {
            openEdit && (
                <EditCategory data={editData} close={()=>setOpenEdit(false)} fetchData={fetchCategory}/>
            )
        }

        {
           openConfimBoxDelete && (
            <CofirmBox close={()=>setOpenConfirmBoxDelete(false)} cancel={()=>setOpenConfirmBoxDelete(false)} confirm={handleDeleteCategory}/>
           ) 
        }
    </section>
  )
}

export default CategoryPage
