import React from 'react';
import { View, Text } from 'react-native';
import { 
    User, MapPin, GraduationCap, Briefcase, Award, Users, 
    Calendar, Mail, Phone, Hash, ShieldCheck, Globe
} from 'lucide-react-native';
import { formatKNQFLevel } from '@meru/shared';

interface SnapshotCVViewerProps {
    snapshot: any;
}

export function SnapshotCVViewer({ snapshot }: SnapshotCVViewerProps) {
    if (!snapshot) return null;

    const SectionHeader = ({ title, icon: Icon }: { title: string, icon: any }) => (
        <View className="flex-row items-center mt-10 mb-6">
            <View className="w-10 h-10 rounded-2xl bg-gray-50 items-center justify-center mr-4 border border-gray-100">
                <Icon size={18} color="#004aad" />
            </View>
            <Text className="text-gray-900 font-black text-xl tracking-tight">{title}</Text>
        </View>
    );

    const DataRow = ({ label, value, icon: Icon }: { label: string, value?: string | number, icon?: any }) => (
        <View className="mb-6 flex-1 min-w-[45%]">
            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5">{label}</Text>
            <View className="flex-row items-center">
                {Icon && <Icon size={14} color="#94a3b8" className="mr-2" />}
                <Text className="text-gray-900 font-bold text-sm leading-tight">{value || 'N/A'}</Text>
            </View>
        </View>
    );

    return (
        <View className="pb-10">
            <View className="bg-[#EEF2FF] p-5 rounded-[32px] border border-[#E0E7FF] mb-6 flex-row items-start">
                <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-3 mt-0.5">
                    <ShieldCheck size={16} color="#4338CA" />
                </View>
                <View className="flex-1">
                    <Text className="text-[#4338CA] font-black text-xs uppercase tracking-widest mb-1">Verification Note</Text>
                    <Text className="text-[#4F46E5] text-[10px] font-bold leading-4">
                        This is a secure, immutable snapshot of your professional profile as it existed during the moment of application submission.
                    </Text>
                </View>
            </View>

            {/* Personal Details */}
            <SectionHeader title="Personal Identity" icon={User} />
            <View className="flex-row flex-wrap">
                <DataRow label="Full Name" value={snapshot.fullName} />
                <DataRow label="Email Address" value={snapshot.email} icon={Mail} />
                <DataRow label="Phone Number" value={snapshot.phoneNumber} icon={Phone} />
                <DataRow label="ID / Passport" value={snapshot.idNumber} icon={Hash} />
                <DataRow label="Gender" value={snapshot.gender} />
                <DataRow label="Date of Birth" value={snapshot.dateOfBirth ? new Date(snapshot.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'} icon={Calendar} />
            </View>

            {/* Location Details */}
            <SectionHeader title="Demographics" icon={MapPin} />
            <View className="flex-row flex-wrap">
                <DataRow label="County of Origin" value={snapshot.homeCounty?.name || 'N/A'} />
                <DataRow label="Sub-County" value={snapshot.homeSubCounty?.name || 'N/A'} />
                <DataRow label="Ward" value={snapshot.ward?.name || 'N/A'} />
                <DataRow label="Ethnicity" value={snapshot.ethnicity?.name || 'N/A'} />
            </View>

            {/* Academic History */}
            <SectionHeader title="Academic History" icon={GraduationCap} />
            {snapshot.qualifications?.length > 0 ? (
                snapshot.qualifications.map((q: any, i: number) => (
                    <View key={i} className="mb-4 p-6 rounded-[32px] border border-gray-100 bg-gray-50">
                        <View className="flex-row justify-between items-start mb-2">
                            <View className="flex-1">
                                <Text className="text-gray-900 font-black text-base">{q.qualificationName}</Text>
                                <Text className="text-gray-500 font-bold text-xs mt-1">{q.institutionName}</Text>
                            </View>
                            <View className="bg-white px-3 py-1 rounded-full border border-gray-100">
                                <Text className="text-[#004aad] text-[10px] font-black uppercase">{formatKNQFLevel(q.level)}</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
                            <Calendar size={12} color="#94a3b8" />
                            <Text className="text-[10px] font-black text-gray-400 ml-2 uppercase">Awarded: {q.yearAwarded}</Text>
                        </View>
                    </View>
                ))
            ) : (
                <Text className="text-gray-400 text-xs italic ml-2">No academic records provided.</Text>
            )}

            {/* Work Experience */}
            <SectionHeader title="Work Experience" icon={Briefcase} />
            {snapshot.employmentHistory?.length > 0 ? (
                snapshot.employmentHistory.map((e: any, i: number) => (
                    <View key={i} className="mb-4 p-6 rounded-[32px] border border-gray-100 bg-gray-50">
                        <Text className="text-gray-900 font-black text-base">{e.designation}</Text>
                        <Text className="text-gray-500 font-bold text-xs mt-1">{e.organizationName}</Text>
                        <View className="flex-row items-center mt-4">
                            <View className="flex-row items-center bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                                <Calendar size={12} color="#004aad" />
                                <Text className="text-[10px] font-black text-gray-500 ml-2 uppercase">
                                    {new Date(e.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} - {e.endDate ? new Date(e.endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Present'}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))
            ) : (
                <Text className="text-gray-400 text-xs italic ml-2">No professional history provided.</Text>
            )}

            {/* Referees */}
            <SectionHeader title="Professional Referees" icon={Users} />
            {snapshot.referees?.length > 0 ? (
                snapshot.referees.map((r: any, i: number) => (
                    <View key={i} className="mb-4 p-6 rounded-[32px] border border-gray-100 bg-gray-50">
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-3 border border-gray-100">
                                <User size={14} color="#004aad" />
                            </View>
                            <View>
                                <Text className="text-gray-900 font-black text-base">{r.fullName}</Text>
                                <Text className="text-gray-500 font-bold text-xs">{r.organization} — {r.designation}</Text>
                            </View>
                        </View>
                        <View className="flex-row mt-2 space-x-6 pt-3 border-t border-gray-100">
                            <View className="flex-row items-center">
                                <Mail size={12} color="#94a3b8" />
                                <Text className="text-[10px] font-black text-gray-400 ml-2">{r.email}</Text>
                            </View>
                            <View className="flex-row items-center ml-4">
                                <Phone size={12} color="#94a3b8" />
                                <Text className="text-[10px] font-black text-gray-400 ml-2">{r.phoneNumber}</Text>
                            </View>
                        </View>
                    </View>
                ))
            ) : (
                <Text className="text-gray-400 text-xs italic ml-2">No references provided.</Text>
            )}
        </View>
    );
}
