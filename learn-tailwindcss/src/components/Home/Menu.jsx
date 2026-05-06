import Card from './Card'
import menu from '../../data'

const Menu = ()=>{
    return(
        <div>
            <div className="text-center">
                <p id='menu' className="inline-block bg-primary px-4 py-2 rounded-2xl text-2xl font-light my-5">
                    Menu de comidas
                </p>
            </div>
            
            <div className="h-0.5 w-full bg-[#EBE1D1] mb-6 rounded"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto px-4 pb-5 sm:px-6 lg:px-8">

                {
                    menu.map(item =>(
                        <Card key={item.id} {...item}/>
                    ))
                }

            </div>
        </div>  
    )
}

export default Menu;