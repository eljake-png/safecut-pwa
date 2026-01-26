"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CloudUpload, ChevronLeft, Loader2 } from 'lucide-react';
// Firebase Imports
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CreateBarberPage: React.FC = () => {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullName: '',
      nickname: '',
      district: '',
      walletAddress: '',
      password: '',
      bio: ''
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Ім'я обов'язкове"),
      nickname: Yup.string().required("Нікнейм обов'язковий"),
      district: Yup.string().required("Район обов'язковий"),
      walletAddress: Yup.string()
        .matches(/^T/, 'Адреса має починатися з T (TRC20)')
        .required("Гаманець обов'язковий"),
      password: Yup.string()
        .min(6, 'Мінімум 6 символів')
        .required("Пароль обов'язковий"),
      bio: Yup.string().required("Біографія обов'язкова")
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        // 1. Поки що ставимо авто-аватарку (бо Firebase Storage ми ще не налаштували)
        // Але UI для завантаження файлу ми залишаємо, щоб дизайн був правильним
        const tempPhotoUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${values.nickname}`;

        // 2. Запис у справжню базу
        await addDoc(collection(db, 'barbers'), {
          fullName: values.fullName,
          nickname: values.nickname,
          district: values.district,
          walletAddress: values.walletAddress,
          password: values.password, // У майбутньому захешуємо
          bio: values.bio,
          status: 'active',
          rating: 5.0,
          reviews: 0,
          photoUrl: tempPhotoUrl,
          joinDate: serverTimestamp()
        });

        alert(`Барбера ${values.nickname} успішно додано в систему!`);
        router.push('/admin/hr'); // Повертаємось до списку
      } catch (error) {
        console.error("Error adding barber:", error);
        alert("Помилка при створенні. Перевір консоль.");
      } finally {
        setIsLoading(false);
      }
    }
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPhoto(event.target.files[0]);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white pb-10">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <ChevronLeft />
        </button>
        <h1 className="text-lg font-bold">Новий барбер</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <form onSubmit={formik.handleSubmit} className="space-y-5">
          
          {/* PHOTO UPLOAD UI */}
          <div className="border-2 border-dashed border-zinc-700 bg-zinc-900/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-zinc-900 transition-all group relative">
            <input
              id="photo"
              name="photo"
              type="file"
              onChange={handlePhotoUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {photo ? (
                <div className="text-center">
                    <p className="text-green-500 font-bold text-sm">{photo.name}</p>
                    <p className="text-zinc-500 text-xs">Натисніть щоб змінити</p>
                </div>
            ) : (
                <>
                    <CloudUpload size={48} className="text-zinc-500 group-hover:text-blue-500 transition-colors mb-3" />
                    <span className="text-zinc-400 text-xs uppercase font-bold group-hover:text-white">Завантажити фото</span>
                </>
            )}
          </div>

          {/* INPUTS */}
          <div>
            <label className="text-zinc-500 text-xs uppercase font-bold ml-1 mb-1 block">Повне ім'я</label>
            <input
              id="fullName"
              {...formik.getFieldProps('fullName')}
              className={`bg-zinc-900 border ${formik.touched.fullName && formik.errors.fullName ? 'border-red-500' : 'border-zinc-700'} focus:border-blue-500 rounded-xl p-4 w-full outline-none transition-colors`}
              placeholder="Тарас Шевченко"
            />
            {formik.touched.fullName && formik.errors.fullName && <div className="text-red-500 text-xs mt-1 ml-1">{formik.errors.fullName}</div>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-zinc-500 text-xs uppercase font-bold ml-1 mb-1 block">Нікнейм</label>
                <input
                id="nickname"
                {...formik.getFieldProps('nickname')}
                className={`bg-zinc-900 border ${formik.touched.nickname && formik.errors.nickname ? 'border-red-500' : 'border-zinc-700'} focus:border-blue-500 rounded-xl p-4 w-full outline-none`}
                placeholder="BarberKing"
                />
            </div>
            <div>
                <label className="text-zinc-500 text-xs uppercase font-bold ml-1 mb-1 block">Район</label>
                <input
                id="district"
                {...formik.getFieldProps('district')}
                className={`bg-zinc-900 border ${formik.touched.district && formik.errors.district ? 'border-red-500' : 'border-zinc-700'} focus:border-blue-500 rounded-xl p-4 w-full outline-none`}
                placeholder="Центр"
                />
            </div>
          </div>

          <div>
            <label className="text-zinc-500 text-xs uppercase font-bold ml-1 mb-1 block">USDT TRC20 Гаманець</label>
            <input
              id="walletAddress"
              {...formik.getFieldProps('walletAddress')}
              className={`bg-zinc-900 border ${formik.touched.walletAddress && formik.errors.walletAddress ? 'border-red-500' : 'border-zinc-700'} focus:border-blue-500 rounded-xl p-4 w-full font-mono text-sm outline-none`}
              placeholder="TJ4..."
            />
            {formik.touched.walletAddress && formik.errors.walletAddress && <div className="text-red-500 text-xs mt-1 ml-1">{formik.errors.walletAddress}</div>}
          </div>

          <div>
            <label className="text-zinc-500 text-xs uppercase font-bold ml-1 mb-1 block">Пароль для входу</label>
            <input
              id="password"
              type="password"
              {...formik.getFieldProps('password')}
              className={`bg-zinc-900 border ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-zinc-700'} focus:border-blue-500 rounded-xl p-4 w-full outline-none`}
              placeholder="******"
            />
             {formik.touched.password && formik.errors.password && <div className="text-red-500 text-xs mt-1 ml-1">{formik.errors.password}</div>}
          </div>

          <div>
            <label className="text-zinc-500 text-xs uppercase font-bold ml-1 mb-1 block">Біографія</label>
            <textarea
              id="bio"
              rows={3}
              {...formik.getFieldProps('bio')}
              className={`bg-zinc-900 border ${formik.touched.bio && formik.errors.bio ? 'border-red-500' : 'border-zinc-700'} focus:border-blue-500 rounded-xl p-4 w-full outline-none resize-none`}
              placeholder="Коротко про досвід та стиль..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => router.back()} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-4 rounded-xl font-bold transition-colors">
                Скасувати
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Створення...
                  </>
                ) : (
                  'Створити'
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBarberPage;