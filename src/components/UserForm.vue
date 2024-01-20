<template>
  <div class="container ">
    <form class="is-half my-4" style="width: 50%;">
      <label class="label is-size-4 has-background-primary p-4 has-text-centered">Input User</label>
      <div class="field is-flex columns mt-4">
          <label class="is-size-5 label p-2 column is-one-third">Email:</label> 
          <div class="control column column is-two-thirds">
            <input class="input" id="email" type="email" v-model="userData.email" />
          </div>
        </div>
      <div class="field is-flex columns">
        <label class="is-size-5 label p-2 column is-one-third">Name:</label>
        <div class="control column is-two-thirds">
          <input class="input" id="name" v-model="userData.name" />
        </div>
      </div>      
      <div class="field is-flex columns">
        <label class="is-size-5 label p-2 column is-one-third">Gender:</label>
        <div class="control column is-two-thirds">
          <div class="select">
            <select id="gender" v-model="userData.gender">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </div>
      <div class="field is-flex columns">
        <label class="is-size-5 label p-2 column is-one-third">Photo:</label>
        <div class="control column is-two-thirds">
          <input class="input" id='photo' type="file" @change="handleFileChange" />
        </div>
      </div>
      <p class="is-size-4 help is-danger has-background-danger-light p-2 has-text-centered" v-if="serverErrorMessage">{{ serverErrorMessage }}</p>
      <div class="p-4">        
        <div class="field is-flex columns">
          <div class="control column is-two-thirds">
            <button id='handle_submit' type="button" class="button is-primary"  @click="handleSubmit">Tambah </button>
          </div>
          <div class="control column is-two-thirds">
            <button id='handle_change' type="button" class="button is-warning" @click="editUser">edit data</button>
          </div>
        </div>
      </div>
    </form>
    <div> 
      <table class="table is-fullwidth">
        <thead>
          <tr class="">
            <th class="is-size-4" @click="toggleSortOrder('name')">
              <div>
                <label id='label_name'>Name</label>
                {{ getSortIcon('name') }}
              </div>
            </th>
            <th class="is-size-4" @click="toggleSortOrder('email')">
              <div>
                <label id='label_email'>Email</label>
                {{ getSortIcon('email') }}
              </div>
            </th>
            <th class="is-size-4" @click="toggleSortOrder('gender')">
              <div class="is-5">
                <label id='label_gender'>Gender </label>
                {{ getSortIcon('gender') }}
              </div>
            </th>
            <th class="is-size-4">
              <label>Photo</label>
            </th>
            <th class="is-size-4">
              <label>Action</label>
            </th>
          </tr>
        </thead>
        <tbody>
        <tr v-for="user in users" :key="user.id">
          <td class="is-size-5">{{ user.name }}</td>
          <td class="is-size-5">{{ user.email }}</td>
          <td class="is-size-5">{{ user.gender }}</td>
          <td class="is-size-5">
            <img :src="user.photo" alt="User Photo" class="image is-128x128" />
          </td>
          <td class="is-size-5">
            <!-- Tombol Hapus -->
            <button id='hapus' @click="deleteUser(user.id)" class="button is-danger mr-2">Delete</button>
            <!-- Tombol Edit -->
            <button id='load_form' @click="loadForm(user.id)" class="button is-warning">Load form</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div> 
</template>
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const userData = ref({
  id: 6,
  name: '',
  email: '',
  gender: 'male',
  photo: null
}); 
const serverErrorMessage = ref('');
const sortColumn = ref('name'); // Kolom pengurutan awal (contoh: ID)
const sortOrder = ref('desc'); // Urutan pengurutan awal (contoh: ascending)


// Event handler untuk menanggapi perubahan file
const handleFileChange = (event) => {
  const file = event.target.files[0];
  console.log('Selected file:', file);

  // Update the ref property
  userData.value.photo = file;
};

const handleSubmit = async () => {
  try {
    const formData = new FormData();
    Object.entries(userData.value).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await axios.post('http://localhost:5000/users', formData);
    console.log('API response:', response.data);

    // Clear form data after successful submission
    userData.value = { id: null, name: '', email: '', gender: '', photo: null, serverErrorMessage:'' };

    // Refresh data after successful submission
    fetchUserData(); // Ensure you have a function named fetchUserData

  } catch (error) {
    console.error('Error creating user:', error);

    if (error.response && error.response.data && error.response.data.msg) {
      // Update server error message
      serverErrorMessage.value = error.response.data.msg;
    } else {
      // Handle other types of errors
    }
  }
};


const users = ref([]);

const fetchUserData = async () => {
  try {
    const response = await axios.get('http://localhost:5000/users');
    let sortedUsers = response.data;

    // Lakukan pengurutan berdasarkan kolom dan urutan
    sortedUsers = sortedUsers.sort((a, b) => {
      const aValue = a[sortColumn.value];
      const bValue = b[sortColumn.value];

      if (sortOrder.value === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    // Simpan hasil pengurutan ke dalam ref users
    users.value = sortedUsers;
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

const toggleSortOrder = (column) => {
  if (sortColumn.value === column) {
    // Jika kolom yang sama diklik lagi, ubah urutan pengurutan
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Jika kolom berbeda diklik, atur ulang kolom dan urutan
    sortColumn.value = column;
    sortOrder.value = 'asc';
  }
  // Panggil metode pengambilan data setelah pengurutan diubah
  fetchUserData();
};

const isColumnSorted = (column) => {
  return sortColumn.value === column;
};

const getSortIcon = (column) => {
  console.log('Sorting:', column, sortColumn.value, sortOrder.value);

  if (isColumnSorted(column)) {
    return sortOrder.value === 'asc' ? '▲' : '▼';
  }

  return '';
};

const deleteUser = async (userId) => {
  try {
    // Kirim permintaan DELETE ke API
    await axios.delete(`http://localhost:5000/users/${userId}`);
    // Log jika penghapusan berhasil
    console.log('User deleted:', userId);
      // Refresh data setelah penghapusan berhasil
    fetchUserData();
  } catch (error) {
    // Tangani kesalahan
    console.error('Error deleting user:', error);
  }
};

const editUser = async () => {
  try {
    if (userData.value && userData.value.id) {
      const userId = userData.value.id;
      const formData = new FormData();
      formData.append('name', userData.value.name);
      formData.append('email', userData.value.email);
      formData.append('gender', userData.value.gender);

      if (userData.value.photo instanceof File) {
        formData.append('photo', userData.value.photo);
      }

      const response = await axios.patch(`http://localhost:5000/users/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('User updated:', response.data);
      userData.value = { id: null, name: '', email: '', gender: '', photo: null, serverErrorMessage: '' };
      fetchUserData();
    } else {
      console.error('User or user.id is undefined');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.response) console.error('Server error details:', error.response.data);
  }
};

const loadForm = (userId) => {
  try {
    const userToEdit = users.value.find(user => user.id === userId);

    if (!userToEdit) {
      console.error('User not found for editing:', userId);
      return;
    }

    console.log('Edit user with ID:', userId);

    // Periksa apakah properti photo ada pada objek userToEdit
    if ('photo' in userToEdit) {
      // Pastikan untuk menyediakan nilai default jika properti tidak ada
      userData.value = { ...userToEdit };
    } else {
      console.error('Photo property not found in user data:', userToEdit);

      // Menetapkan nilai default untuk userData jika properti photo tidak ada
      userData.value = { ...userToEdit, photo: null };
    }
  } catch (error) {
    console.error('Error editing user:', error);
  }
};

onMounted(() => {
  fetchUserData();
});

</script>

<style>
.sort-icon {
  margin-left: 10px;
  /* Adjust the spacing between text and icon */
}
</style>
