import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [currentUser, setCurrentUser] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [recipeTitle, setRecipeTitle] = useState('')
  const [recipeDesc, setRecipeDesc] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState(1); 

  // CANLI BACKEND URL'İN
  const API_URL = 'https://yemek-projesi-backend.onrender.com';

  // 1. Tarifleri Getirme (Backend @Get() -> /users)
  const tarifleriGetir = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`) 
      let list = []
      res.data.forEach(u => {
        if(u.recipes) {
          u.recipes.forEach(r => list.push({ ...r, sef: u.username, sefId: u.id }))
        }
      })
      setRecipes(list)
    } catch (e) { 
      console.log("Veri çekme hatası:", e) 
    }
  }

  useEffect(() => { if (currentUser) tarifleriGetir() }, [currentUser])

  // 2. Giriş Yapma (Backend @Post('login') -> /users/login)
  const loginYap = async () => {
    try {
      const res = await axios.post(`${API_URL}/users/login`, { username, password })
      setCurrentUser(res.data)
    } catch (e) { 
      alert("Hatalı kullanıcı adı veya şifre!") 
    }
  }

  // 3. Kayıt Olma (Backend @Post('register') -> /users/register)
  const kayitOl = async () => {
    try {
      await axios.post(`${API_URL}/users/register`, { username, password, role })
      alert("Kayıt başarılı! Giriş yapabilirsin."); 
      setIsRegister(false)
    } catch (e) { 
      alert("Kayıt hatası!") 
    }
  }

  // 4. Tarif Ekleme (Backend @Post('add-recipe') -> /users/add-recipe)
  const tarifEkle = async () => {
    try {
      await axios.post(`${API_URL}/users/add-recipe`, { 
        title: recipeTitle, 
        description: recipeDesc, 
        userId: currentUser.id,
        categoryIds: [selectedCategoryId] 
      })
      setRecipeTitle(''); 
      setRecipeDesc(''); 
      tarifleriGetir();
      alert("Tarif başarıyla eklendi!");
    } catch (e) { 
      alert("Tarif eklenirken hata oluştu!"); 
    }
  }

  // 5. Tarif Silme (Backend @Delete('recipe/:id') -> /users/recipe/:id)
  const tarifSil = async (id) => {
    if(window.confirm("Bu tarifi silmek istiyor musun?")) {
      try {
        await axios.delete(`${API_URL}/users/recipe/${id}`)
        tarifleriGetir()
      } catch (e) { 
        alert("Silme işlemi başarısız!") 
      }
    }
  }

  // 6. Tarif Güncelleme (Backend @Put('recipe/:id') -> /users/recipe/:id)
  const tarifGuncelle = async (id, eskiAd) => {
    const yeniAd = prompt("Yemek adını güncelle:", eskiAd)
    if(yeniAd) {
      try {
        await axios.put(`${API_URL}/users/recipe/${id}`, { title: yeniAd })
        tarifleriGetir()
      } catch (e) { 
        alert("Güncelleme işlemi başarısız!") 
      }
    }
  }

  return (
    <div style={{ 
      padding: '30px', textAlign: 'center', fontFamily: 'Arial', width: '100vw', minHeight:'100vh', margin:0,
      backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://cairoscene.com/Content/Admin/Uploads/Articles/ArticlesMainPhoto/1155510/b9884374-947c-4ad8-8cbb-86be410ef6ab.jpg')", 
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
    }}>
      <h1 style={{ color: '#ffffff', textShadow: '2px 2px 10px rgba(0,0,0,0.8)' }}>
        🍅 Tarif Dünyası
      </h1>
      {!currentUser ? (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', display: 'inline-block', boxShadow: '0 4px 10px rgba(26, 192, 35, 0.1)' }}>
          <h2>{isRegister ? 'Kayıt Ol' : 'Giriş Yap'}</h2>
          <input placeholder="Kullanıcı Adı" style={inputStyle} onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Şifre" style={inputStyle} onChange={e => setPassword(e.target.value)} />
          {isRegister && (
            <select style={inputStyle} onChange={e => setRole(e.target.value)}>
              <option value="user">Gurme (İzleyici)</option>
              <option value="admin">Şef (Yönetici)</option>
            </select>
          )}
          <button onClick={isRegister ? kayitOl : loginYap} style={btnStyle}>{isRegister ? 'Kaydol' : 'Giriş'}</button>
          <p onClick={() => setIsRegister(!isRegister)} style={{ cursor: 'pointer', color: '#e67e22', marginTop: '15px' }}>
            {isRegister ? 'Zaten hesabım var? Giriş yap' : 'Hesabın yok mu? Kayıt ol'}
          </p>
        </div>
      ) : (
        <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 20px', color:'white'}}>
             <h3>👤 {currentUser.username} ({currentUser.role === 'admin' ? 'Şef' : 'Gurme'})</h3>
             <button onClick={() => setCurrentUser(null)} style={{backgroundColor:'#7f8c8d', color:'white', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}>Çıkış</button>
          </div>

          {currentUser.role === 'admin' && (
            <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '10px', marginBottom: '20px', border:'1px dashed #d35400' }}>
              <h4>👨‍🍳 Yeni Tarif Paylaş</h4>
              <input value={recipeTitle} placeholder="Yemek Adı" style={inputStyle} onChange={e => setRecipeTitle(e.target.value)} />
              <select style={inputStyle} value={selectedCategoryId} onChange={e => setSelectedCategoryId(Number(e.target.value))}>
                <option value="1">Ana Yemek</option>
                <option value="2">Tatlı</option>
                <option value="3">Çorba</option>
              </select>
              <textarea value={recipeDesc} placeholder="Nasıl Yapılır?" style={inputStyle} onChange={e => setRecipeDesc(e.target.value)} />
              <button onClick={tarifEkle} style={btnStyle}>Yayınla</button>
            </div>
          )}
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop:'30px' }}>
            {recipes.map(r => (
              <div key={r.id} style={cardStyle}>
                <div onClick={() => setSelectedRecipe(r)} style={{cursor:'pointer'}}>
                   <h3 style={{color:'#d35400'}}>{r.title}</h3>
                   <p style={{fontSize:'12px', color:'#7f8c8d'}}>Şef: {r.sef}</p>
                </div>
                {currentUser.role === 'admin' && (
                  <div style={{marginTop:'10px', borderTop:'1px solid #eee', paddingTop:'10px'}}>
                    <button onClick={() => tarifGuncelle(r.id, r.title)} style={{fontSize:'11px', marginRight:'5px', color:'blue', background:'none', border:'none', cursor:'pointer'}}>Düzenle</button>
                    <button onClick={() => tarifSil(r.id)} style={{fontSize:'11px', color:'red', background:'none', border:'none', cursor:'pointer'}}>Sil</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedRecipe && (
            <div style={modalStyle} onClick={() => setSelectedRecipe(null)}>
              <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <h2 style={{color:'#d35400'}}>{selectedRecipe.title}</h2>
                <p style={{textAlign:'left', whiteSpace:'pre-wrap'}}>{selectedRecipe.description || "Tarif detayı girilmemiş."}</p>
                <hr />
                <button onClick={() => setSelectedRecipe(null)} style={btnStyle}>Kapat</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const inputStyle = { display: 'block', width: '90%', maxWidth:'300px', padding: '10px', margin: '10px auto', borderRadius: '5px', border: '1px solid #ddd' }
const btnStyle = { padding: '10px 20px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
const cardStyle = { border: '1px solid #ddd', padding: '15px', borderRadius: '10px', backgroundColor: 'white', minWidth: '200px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)' }
const modalStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }
const modalContentStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '15px', maxWidth: '500px', width:'90%' }

export default App