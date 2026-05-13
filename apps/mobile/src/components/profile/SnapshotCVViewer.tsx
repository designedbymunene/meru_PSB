import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { 
    User, MapPin, GraduationCap, Briefcase, Award, Users, 
    Calendar, Mail, Phone, Hash, Globe, ShieldCheck 
} from 'lucide-react-native';

interface SnapshotCVViewerProps {
    snapshot: any;
}

export function SnapshotCVViewer({ snapshot }: SnapshotCVViewerProps) {
    if (!snapshot) return null;

    const SectionHeader = ({ title, icon: Icon }: { title: string, icon: any }) => (
        <View className="flex-row items-center mt-8 mb-4">
            <View className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
                <Icon size={16} color="#64748b" />
            </View>
            <Text className="text-gray-900 dark:text-white font-black text-lg">{title}</Text>
        </View>
    );

    const DataRow = ({ label, value, icon: Icon }: { label: string, value?: string | number, icon?: any }) => (
        <View className="mb-4">
            <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</Text>
            <View className="flex-row items-center">
                {Icon && <Icon size={14} color="#94a3b8" className="mr-2" />}
                <Text className="text-gray-900 dark:text-white font-bold text-sm">{value || 'N/A'}</Text>
            </View>
        </View>
    );

    return (
        <View className="space-y-2">
            <View className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 mb-4 flex-row items-center">
                <ShieldCheck size={20} color="#004aad" />
                <Text className="text-blue-900 dark:text-blue-200 text-[10px] font-bold ml-2">
                    This is an immutable snapshot of your CV at the time of submission.
                </Text>
            </View>

            {/* Personal Details */}
            <SectionHeader title="Personal Details" icon={User} />
            <View className="grid grid-cols-2 gap-4">
                <DataRow label="Full Name" value={snapshot.fullName} />
                <DataRow label="Email" value={snapshot.email} icon={Mail} />
                <DataRow label="Phone" value={snapshot.phoneNumber} icon={Phone} />
                <DataRow label="ID Number" value={snapshot.idNumber} icon={Hash} />
                <DataRow label="Gender" value={snapshot.gender} />
                <DataRow label="Date of Birth" value={snapshot.dateOfBirth ? new Date(snapshot.dateOfBirth).toLocaleDateString() : 'N/A'} icon={Calendar} />
            </View>

            {/* Location Details */}
            <SectionHeader title="Location & Demographic" icon={MapPin} />
            <View className="grid grid-cols-2 gap-4">
                <DataRow label="County" value={snapshot.homeCounty?.name || 'N/A'} />
                <DataRow label="Sub-County" value={snapshot.homeSubCounty?.name || 'N/A'} />
                <DataRow label="Ward" value={snapshot.ward?.name || 'N/A'} />
                <DataRow label="Ethnicity" value={snapshot.ethnicity?.name || 'N/A'} />
            </View>

            {/* Academic History */}
            <SectionHeader title="Academic History" icon={GraduationCap} />
            {snapshot.qualifications?.length > 0 ? (
                snapshot.qualifications.map((q: any, i: number) => (
                    <View key={i} className="mb-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                        <Text className="text-gray-900 dark:text-white font-bold text-sm">{q.qualificationName}</Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">{q.institutionName}</Text>
                        <View className="flex-row justify-between mt-2">
                            <Text className="text-[10px] font-bold text-blue-600">{q.level}</Text>
                            <Text className="text-[10px] font-bold text-gray-400">Awarded: {q.yearAwarded}</Text>
                        </View>
                    </View>
                ))
            ) : (
                <Text className="text-gray-400 text-xs italic ml-1">No qualifications listed in this snapshot.</Text>
            )}

            {/* Work Experience */}
            <SectionHeader title="Work Experience" icon={Briefcase} />
            {snapshot.employmentHistory?.length > 0 ? (
                snapshot.employmentHistory.map((e: any, i: number) => (
                    <View key={i} className="mb-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                        <Text className="text-gray-900 dark:text-white font-bold text-sm">{e.designation}</Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">{e.organizationName}</Text>
                        <View className="flex-row items-center mt-2">
                            <Calendar size={10} color="#94a3b8" />
                            <Text className="text-[10px] font-bold text-gray-400 ml-1">
                                {new Date(e.startDate).toLocaleDateString()} - {e.endDate ? new Date(e.endDate).toLocaleDateString() : 'Present'}
                            </Text>
                        </View>
                    </View>
                ))
            ) : (
                <Text className="text-gray-400 text-xs italic ml-1">No work experience listed in this snapshot.</Text>
            )}

            {/* Referees */}
            <SectionHeader title="Referees" icon={Users} />
            {snapshot.referees?.length > 0 ? (
                snapshot.referees.map((r: any, i: number) => (
                    <View key={i} className="mb-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                        <Text className="text-gray-900 dark:text-white font-bold text-sm">{r.fullName}</Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">{r.organization} - {r.designation}</Text>
                        <View className="flex-row mt-2 space-x-4">
                            <Text className="text-[10px] font-bold text-gray-400">{r.email}</Text>
                            <Text className="text-[10px] font-bold text-gray-400">{r.phoneNumber}</Text>
                        </View>
                    </View>
                ))
            ) : (
                <Text className="text-gray-400 text-xs italic ml-1">No referees listed in this snapshot.</Text>
            )}
            
            <View className="h-10" />
        </View>
    );
}
