import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Navigation, ChevronLeft, Building2, Star, Shield, Car, Search, Loader2, AlertTriangle, MapPin as LocationIcon } from 'lucide-react';
import { useAppStore } from '../store/useAppStore.js';
import type { Hospital } from '../types/index.js';
import { Loader } from '@googlemaps/js-api-loader';


export default function HospitalFinder() {
  const { analysisResult, setStep } = useAppStore();
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const recommendedSpecialists = analysisResult
    ?.flatMap(d => d.specialists)
    .filter((v, i, a) => a.indexOf(v) === i) || [];

  // Google Places API를 사용한 실제 병원 검색
  const searchNearbyHospitals = useCallback(async (location: { lat: number; lng: number }) => {
    if (!map) return;
    
    setIsLoadingHospitals(true);
    setSearchError(null);

    try {
      console.log('Google Places API로 병원 검색 중...');
      
      const service = new google.maps.places.PlacesService(map);
      
      // 진료과별 검색어 매핑
      const getSearchKeywords = (specialists: string[]): string[] => {
        const keywordMap: { [key: string]: string[] } = {
          '내과': ['internal medicine', 'hospital', 'clinic'],
          '외과': ['surgery', 'surgical', 'hospital'],
          '정형외과': ['orthopedic', 'orthopedics', 'hospital'],
          '신경과': ['neurology', 'neurological', 'hospital'],
          '소화기내과': ['gastroenterology', 'digestive', 'hospital'],
          '이비인후과': ['ENT', 'otolaryngology', 'hospital'],
          '피부과': ['dermatology', 'skin', 'clinic'],
          '안과': ['ophthalmology', 'eye', 'clinic'],
          '산부인과': ['gynecology', 'obstetrics', 'womens health'],
          '소아과': ['pediatrics', 'children', 'clinic'],
          '심장내과': ['cardiology', 'heart', 'hospital'],
          '호흡기내과': ['pulmonology', 'respiratory', 'hospital']
        };

        const keywords = new Set<string>();
        specialists.forEach(spec => {
          const specKeywords = keywordMap[spec] || ['hospital'];
          specKeywords.forEach(keyword => keywords.add(keyword));
        });
        
        return Array.from(keywords);
      };

      const searchKeywords = recommendedSpecialists.length > 0 
        ? getSearchKeywords(recommendedSpecialists)
        : ['hospital', 'clinic'];

      console.log('검색 키워드:', searchKeywords);

      const allResults: Hospital[] = [];
      const searchPromises = searchKeywords.map(keyword => 
        new Promise<google.maps.places.PlaceResult[]>((resolve) => {
          const request: google.maps.places.PlaceSearchRequest = {
            location: new google.maps.LatLng(location.lat, location.lng),
            radius: 10000, // 10km 반경
            keyword: keyword,
            type: 'hospital'
          };

          service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else {
              console.warn(`${keyword} 검색 실패:`, status);
              resolve([]);
            }
          });
        })
      );

      const searchResults = await Promise.all(searchPromises);
      const flatResults = searchResults.flat();
      
      // 중복 제거 (place_id 기준)
      const uniqueResults = flatResults.filter((place, index, self) => 
        self.findIndex(p => p.place_id === place.place_id) === index
      );

      console.log(`총 ${uniqueResults.length}개의 병원을 찾았습니다.`);

      // Hospital 타입으로 변환
      uniqueResults.forEach((place) => {
        if (place.geometry?.location && place.place_id) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const distance = calculateDistance(location.lat, location.lng, lat, lng);

          const hospital: Hospital = {
            id: place.place_id,
            name: place.name || '알 수 없는 병원',
            address: place.vicinity || place.formatted_address || '주소 정보 없음',
            phone: '전화번호 확인 필요',
            specialists: getSpecialistsFromPlace(place),
            location: { lat, lng },
            distance,
            operatingHours: place.opening_hours?.open_now ? '영업 중' : '영업시간 확인 필요',
            isOpen: place.opening_hours?.open_now ?? true,
            rating: place.rating
          };
          
          allResults.push(hospital);
        }
      });

      // 거리순 정렬 및 20km 이내만 필터링
      const nearbyHospitals = allResults
        .filter(hospital => hospital.distance! <= 20)
        .sort((a, b) => a.distance! - b.distance!);

      setHospitals(nearbyHospitals);

    } catch (error) {
      console.error('병원 검색 중 오류:', error);
      setSearchError('병원 검색 중 오류가 발생했습니다.');
      setHospitals([]);
    }

    setIsLoadingHospitals(false);
  }, [map, recommendedSpecialists]);

  // Places API 결과에서 진료과 추정
  const getSpecialistsFromPlace = (place: google.maps.places.PlaceResult): string[] => {
    const name = place.name?.toLowerCase() || '';
    const types = place.types || [];
    
    const specialists: string[] = [];
    
    // 병원 이름에서 진료과 추정
    if (name.includes('종합병원') || name.includes('대학병원') || name.includes('병원')) {
      specialists.push('내과', '외과', '정형외과', '신경과');
    }
    if (name.includes('정형외과') || name.includes('orthopedic')) {
      specialists.push('정형외과');
    }
    if (name.includes('피부과') || name.includes('dermatology')) {
      specialists.push('피부과');
    }
    if (name.includes('안과') || name.includes('eye') || name.includes('ophthalmology')) {
      specialists.push('안과');
    }
    if (name.includes('치과') || name.includes('dental')) {
      specialists.push('치과');
    }
    if (name.includes('산부인과') || name.includes('여성') || name.includes('gynecology')) {
      specialists.push('산부인과');
    }
    if (name.includes('소아과') || name.includes('pediatric')) {
      specialists.push('소아과');
    }
    if (name.includes('이비인후과') || name.includes('ent')) {
      specialists.push('이비인후과');
    }
    
    // Google Places types에서 추정
    if (types.includes('hospital')) {
      if (specialists.length === 0) {
        specialists.push('내과', '외과');
      }
    }
    if (types.includes('doctor') || types.includes('health')) {
      if (specialists.length === 0) {
        specialists.push('내과');
      }
    }
    
    return specialists.length > 0 ? specialists : ['내과'];
  };

  // 거리 계산 함수
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10; // 소수점 1자리로 반올림
  };

  useEffect(() => {
    // 사용자 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('사용자 위치 확인:', location);
          setUserLocation(location);
          setLocationError(null);
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
          let errorMessage = '';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '위치 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다.';
              break;
            case error.TIMEOUT:
              errorMessage = '위치 정보 요청이 시간 초과되었습니다.';
              break;
            default:
              errorMessage = '위치 정보를 가져오는 중 알 수 없는 오류가 발생했습니다.';
              break;
          }
          
          setLocationError(errorMessage);
          // 오류 발생시 기본 위치 설정하지 않음 - 사용자가 직접 선택하도록
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5분
        }
      );
    } else {
      setLocationError('브라우저에서 위치 서비스를 지원하지 않습니다.');
    }
  }, []);

  // Google Maps 초기화
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      const mapInstance = new google.maps.Map(mapRef.current!, {
        center: userLocation,
        zoom: 14,
        styles: [
          {
            featureType: 'poi.medical',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });

      setMap(mapInstance);
    });
  }, [userLocation]);

  // 사용자 위치가 확인되고 지도가 로드되면 병원 검색
  useEffect(() => {
    if (userLocation && map && hospitals.length === 0) {
      searchNearbyHospitals(userLocation);
    }
  }, [userLocation, map, hospitals.length, searchNearbyHospitals]);

  // 병원 마커 추가
  useEffect(() => {
    if (!map || hospitals.length === 0) return;

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null));

    // 새 마커 추가
    const newMarkers: google.maps.Marker[] = [];
    
    hospitals.forEach((hospital, index) => {
      const marker = new google.maps.Marker({
        position: hospital.location,
        map: map,
        title: hospital.name,
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: selectedHospital?.id === hospital.id ? '#2563eb' : '#10b981',
          fillOpacity: 0.9,
          strokeColor: 'white',
          strokeWeight: 2
        }
      });

      marker.addListener('click', () => {
        setSelectedHospital(hospital);
      });

      newMarkers.push(marker);
    });

    // 사용자 위치 마커
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: '내 위치',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2
        }
      });
      newMarkers.push(userMarker);
    }

    setMarkers(newMarkers);
  }, [map, hospitals.length, selectedHospital?.id, userLocation]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-soft p-8"
    >
      <div className="mb-8">
        <button
          onClick={() => setStep(3)}
          className="mb-4 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-soft inline-flex items-center gap-2 text-gray-600"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">이전으로</span>
        </button>
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl mb-4">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            추천 병원 목록
          </h2>
          <p className="text-gray-600">분석 결과에 적합한 병원을 찾아드렸습니다</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">
            AI 분석 결과 추천 진료과
          </p>
          {isLoadingHospitals && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>병원 데이터베이스 검색 중...</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {recommendedSpecialists.map((spec, idx) => (
            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary/30 text-primary-700 rounded-full text-sm font-semibold shadow-sm">
              <Shield className="w-3.5 h-3.5" />
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* 위치 오류 표시 */}
      {locationError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <LocationIcon className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 mb-2">위치 정보 불러오기 오류</p>
              <p className="text-sm text-red-700 mb-3">{locationError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 검색 결과 표시 */}
      {hospitals.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              현재 위치에서 {hospitals.length}개의 병원을 찾았습니다
              {recommendedSpecialists.length > 0 && (
                <span className="ml-1">
                  ({recommendedSpecialists.join(', ')} 진료 가능)
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* 검색 오류 표시 */}
      {searchError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">
              {searchError}
            </span>
          </div>
        </div>
      )}

      {/* 병원 없음 표시 */}
      {!isLoadingHospitals && !locationError && userLocation && hospitals.length === 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">
              현재 위치 주변에서 병원을 찾을 수 없습니다.
              {recommendedSpecialists.length > 0 && (
                <span className="ml-1">
                  다른 지역을 검색하거나 {recommendedSpecialists.join(', ')} 진료가 가능한 병원을 직접 찾아보세요.
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
          {hospitals.length > 0 ? (
            hospitals.map((hospital, index) => (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                  selectedHospital?.id === hospital.id
                    ? 'border-primary bg-gradient-to-br from-primary/5 to-secondary/5 shadow-medium'
                    : 'border-gray-200 hover:border-primary/30 hover:shadow-soft bg-white'
                }`}
                onClick={() => setSelectedHospital(hospital)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-800">
                        {hospital.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      {hospital.rating ? (
                        <>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(hospital.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">({hospital.rating.toFixed(1)})</span>
                        </>
                      ) : (
                        <>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">(4.0)</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    hospital.isOpen
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300'
                      : 'bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border border-red-300'
                  }`}>
                    {hospital.isOpen ? '진료중' : '진료종료'}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-gray-700 flex-1">{hospital.address}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                      <Phone className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{hospital.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-gray-700">{hospital.operatingHours}</span>
                  </div>
                  {hospital.distance && (
                    <div className="flex items-center">
                      <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                        <Car className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-gray-700">
                        <span className="font-semibold">{hospital.distance}km</span>
                        <span className="text-gray-500"> (약 {Math.round(hospital.distance * 5)}분 소요)</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-2">진료 가능 과목</p>
                  <div className="flex flex-wrap gap-1.5">
                    {hospital.specialists.map((spec, idx) => {
                      const isRecommended = recommendedSpecialists.includes(spec);
                      return (
                        <span
                          key={idx}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            isRecommended
                              ? 'bg-primary/10 text-primary-700 border border-primary/30'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {spec}
                          {isRecommended && ' ✓'}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={`tel:${hospital.phone}`}
                    className="py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white text-center rounded-xl text-sm font-semibold hover:shadow-soft transition-all duration-200 flex items-center justify-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="w-4 h-4" />
                    전화하기
                  </motion.a>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://map.naver.com/v5/search/${encodeURIComponent(hospital.address)}`,
                        '_blank'
                      );
                    }}
                  >
                    <Navigation className="w-4 h-4" />
                    길찾기
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-2xl mb-4">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">
                추천 진료과와 일치하는 병원이 없습니다.
              </p>
            </div>
          )}
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-inner h-96 lg:h-full min-h-[400px]">
          <div ref={mapRef} className="w-full h-full" />
          {!map && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-2xl mb-4 shadow-soft">
                  <MapPin className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <p className="text-gray-600 font-medium">지도를 불러오는 중...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}